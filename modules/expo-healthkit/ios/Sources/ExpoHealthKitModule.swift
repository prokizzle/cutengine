import ExpoModulesCore
import HealthKit

public class ExpoHealthKitModule: Module {
    private let store = HKHealthStore()

    public func definition() -> ModuleDefinition {
        Name("ExpoHealthKit")

        AsyncFunction("requestAuthorization") { (readTypes: [String], writeTypes: [String]) -> Bool in
            let readSet = Set(readTypes.compactMap { sampleType(for: $0) })
            let writeSet = Set(writeTypes.compactMap { sampleType(for: $0) })
            return try await store.requestAuthorization(
                toShare: writeSet,
                read: readSet
            )
        }

        // MARK: - Body Mass

        AsyncFunction("saveWeight") { (valueKg: Double, date: Date?) in
            let weightType = HKObjectType.quantityType(forIdentifier: .bodyMass)!
            let quantity = HKQuantity(unit: .gramUnit(with: .kilo), doubleValue: valueKg)
            let sample = HKQuantitySample(
                type: weightType,
                quantity: quantity,
                start: date ?? Date(),
                end: date ?? Date()
            )
            try await store.save(sample)
        }

        AsyncFunction("getLatestWeight") { () -> [String: Any]? in
            let weightType = HKObjectType.quantityType(forIdentifier: .bodyMass)!
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)
            let result = try await queryLatest(type: weightType, sort: sort)

            guard let sample = result as? HKQuantitySample else { return nil }
            let kg = sample.quantity.doubleValue(for: .gramUnit(with: .kilo))
            return [
                "valueKg": kg,
                "valueLb": kg * 2.20462,
                "date": sample.endDate.timeIntervalSince1970 * 1000,
            ]
        }

        // MARK: - Active Energy

        AsyncFunction("getActiveEnergyToday") { () -> Double in
            let energyType = HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!
            let cal = Calendar.current
            let start = cal.startOfDay(for: Date())
            let end = Date()
            let predicate = HKQuery.predicateForSamples(withStart: start, end: end)
            let samples = try await querySamples(type: energyType, predicate: predicate)

            return samples
                .compactMap { ($0 as? HKQuantitySample)?.quantity.doubleValue(for: .kilocalorie()) }
                .reduce(0, +)
        }

        // MARK: - Steps

        AsyncFunction("getStepCountToday") { () -> Double in
            let stepType = HKObjectType.quantityType(forIdentifier: .stepCount)!
            let cal = Calendar.current
            let start = cal.startOfDay(for: Date())
            let predicate = HKQuery.predicateForSamples(withStart: start, end: Date())
            let samples = try await querySamples(type: stepType, predicate: predicate)

            return samples
                .compactMap { ($0 as? HKQuantitySample)?.quantity.doubleValue(for: .count()) }
                .reduce(0, +)
        }
    }

    // MARK: - Helpers

    private func sampleType(for identifier: String) -> HKSampleType? {
        switch identifier {
        case "bodyMass": return HKObjectType.quantityType(forIdentifier: .bodyMass)
        case "activeEnergyBurned": return HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)
        case "stepCount": return HKObjectType.quantityType(forIdentifier: .stepCount)
        case "heartRate": return HKObjectType.quantityType(forIdentifier: .heartRate)
        case "restingHeartRate": return HKObjectType.quantityType(forIdentifier: .restingHeartRate)
        default: return nil
        }
    }

    private func queryLatest(
        type: HKSampleType,
        sort: NSSortDescriptor,
        limit: Int = 1
    ) async throws -> HKSample? {
        try await withCheckedThrowingContinuation { cont in
            let query = HKSampleQuery(
                sampleType: type,
                predicate: nil,
                limit: limit,
                sortDescriptors: [sort]
            ) { _, results, error in
                if let error { cont.resume(throwing: error) }
                else { cont.resume(returning: results?.first) }
            }
            store.execute(query)
        }
    }

    private func querySamples(
        type: HKSampleType,
        predicate: NSPredicate,
        limit: Int = HKObjectQueryNoLimit
    ) async throws -> [HKSample] {
        try await withCheckedThrowingContinuation { cont in
            let query = HKSampleQuery(
                sampleType: type,
                predicate: predicate,
                limit: limit,
                sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)]
            ) { _, results, error in
                if let error { cont.resume(throwing: error) }
                else { cont.resume(returning: results ?? []) }
            }
            store.execute(query)
        }
    }
}
