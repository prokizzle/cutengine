import ExpoModulesCore
import HealthKit

enum HealthKitBridgeError: LocalizedError {
    case unknownTypeIdentifier(String)
    case invalidDate(String)

    var errorDescription: String? {
        switch self {
        case .unknownTypeIdentifier(let value):
            return "Unknown HealthKit type identifier: \(value)"
        case .invalidDate(let value):
            return "Invalid ISO8601 date: \(value)"
        }
    }
}

struct WeightSampleRecord: Record {
    @Field var dateISO: String = ""
    @Field var valueKg: Double = 0

    init() {}

    init(dateISO: String, valueKg: Double) {
        self.dateISO = dateISO
        self.valueKg = valueKg
    }
}

struct BodyFatSampleRecord: Record {
    @Field var dateISO: String = ""
    @Field var valueFraction: Double = 0

    init() {}

    init(dateISO: String, valueFraction: Double) {
        self.dateISO = dateISO
        self.valueFraction = valueFraction
    }
}

/// HealthKit bridge: body-mass read/write plus body-composition and activity reads.
/// HealthKit stays the source of truth for body measurements — CycleStore never
/// duplicates them (Decision 006).
public class ExpoHealthKitModule: Module {
    private static let healthStore = HKHealthStore()

    private static let isoFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()

    private static let isoFallbackFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter
    }()

    public func definition() -> ModuleDefinition {
        Name("ExpoHealthKit")

        AsyncFunction("requestAuthorization") { (read: [String], write: [String]) -> Bool in
            guard HKHealthStore.isHealthDataAvailable() else { return false }
            let readTypes = Set(try read.map { try Self.quantityType($0) })
            let writeTypes = Set(try write.map { try Self.quantityType($0) })
            try await Self.healthStore.requestAuthorization(toShare: writeTypes, read: readTypes)
            return true
        }

        AsyncFunction("saveWeight") { (kg: Double, date: Date?) in
            let when = date ?? Date()
            let sample = HKQuantitySample(
                type: HKQuantityType(.bodyMass),
                quantity: HKQuantity(unit: .gramUnit(with: .kilo), doubleValue: kg),
                start: when,
                end: when
            )
            try await Self.healthStore.save(sample)
        }

        AsyncFunction("getLatestWeight") { () -> WeightSampleRecord? in
            let samples = try await Self.querySamples(
                type: HKQuantityType(.bodyMass),
                predicate: nil,
                limit: 1,
                ascending: false
            )
            guard let sample = samples.first else { return nil }
            return WeightSampleRecord(
                dateISO: Self.isoFormatter.string(from: sample.startDate),
                valueKg: sample.quantity.doubleValue(for: .gramUnit(with: .kilo))
            )
        }

        AsyncFunction("getActiveEnergyToday") { () -> Double in
            let startOfDay = Calendar.current.startOfDay(for: Date())
            let predicate = HKQuery.predicateForSamples(
                withStart: startOfDay,
                end: Date(),
                options: .strictStartDate
            )
            return try await Self.cumulativeSum(
                type: HKQuantityType(.activeEnergyBurned),
                predicate: predicate,
                unit: .kilocalorie()
            )
        }

        AsyncFunction("getLatestBodyFat") { () -> BodyFatSampleRecord? in
            let samples = try await Self.querySamples(
                type: HKQuantityType(.bodyFatPercentage),
                predicate: nil,
                limit: 1,
                ascending: false
            )
            guard let sample = samples.first else { return nil }
            return Self.bodyFatRecord(sample)
        }

        AsyncFunction("getWeightSamples") { (startDateISO: String) -> [WeightSampleRecord] in
            let start = try Self.parseDate(startDateISO)
            let predicate = HKQuery.predicateForSamples(
                withStart: start,
                end: Date(),
                options: .strictStartDate
            )
            let samples = try await Self.querySamples(
                type: HKQuantityType(.bodyMass),
                predicate: predicate,
                limit: HKObjectQueryNoLimit,
                ascending: true
            )
            return samples.map { sample in
                WeightSampleRecord(
                    dateISO: Self.isoFormatter.string(from: sample.startDate),
                    valueKg: sample.quantity.doubleValue(for: .gramUnit(with: .kilo))
                )
            }
        }

        AsyncFunction("getBodyFatSamples") {
            (startDateISO: String, endDateISO: String) -> [BodyFatSampleRecord] in
            let predicate = HKQuery.predicateForSamples(
                withStart: try Self.parseDate(startDateISO),
                end: try Self.parseDate(endDateISO),
                options: .strictStartDate
            )
            let samples = try await Self.querySamples(
                type: HKQuantityType(.bodyFatPercentage),
                predicate: predicate,
                limit: HKObjectQueryNoLimit,
                ascending: true
            )
            return samples.map(Self.bodyFatRecord)
        }
    }

    private static func quantityType(_ identifier: String) throws -> HKQuantityType {
        switch identifier {
        case "bodyMass":
            return HKQuantityType(.bodyMass)
        case "activeEnergyBurned":
            return HKQuantityType(.activeEnergyBurned)
        case "stepCount":
            return HKQuantityType(.stepCount)
        case "bodyFatPercentage":
            return HKQuantityType(.bodyFatPercentage)
        default:
            throw HealthKitBridgeError.unknownTypeIdentifier(identifier)
        }
    }

    private static func parseDate(_ value: String) throws -> Date {
        guard let date = isoFormatter.date(from: value) ?? isoFallbackFormatter.date(from: value) else {
            throw HealthKitBridgeError.invalidDate(value)
        }
        return date
    }

    private static func bodyFatRecord(_ sample: HKQuantitySample) -> BodyFatSampleRecord {
        BodyFatSampleRecord(
            dateISO: isoFormatter.string(from: sample.startDate),
            valueFraction: sample.quantity.doubleValue(for: .percent())
        )
    }

    private static func querySamples(
        type: HKQuantityType,
        predicate: NSPredicate?,
        limit: Int,
        ascending: Bool
    ) async throws -> [HKQuantitySample] {
        try await withCheckedThrowingContinuation { continuation in
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: ascending)
            let query = HKSampleQuery(
                sampleType: type,
                predicate: predicate,
                limit: limit,
                sortDescriptors: [sort]
            ) { _, samples, error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume(returning: (samples as? [HKQuantitySample]) ?? [])
                }
            }
            healthStore.execute(query)
        }
    }

    private static func cumulativeSum(
        type: HKQuantityType,
        predicate: NSPredicate,
        unit: HKUnit
    ) async throws -> Double {
        try await withCheckedThrowingContinuation { continuation in
            let query = HKStatisticsQuery(
                quantityType: type,
                quantitySamplePredicate: predicate,
                options: .cumulativeSum
            ) { _, statistics, error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume(returning: statistics?.sumQuantity()?.doubleValue(for: unit) ?? 0)
                }
            }
            healthStore.execute(query)
        }
    }
}
