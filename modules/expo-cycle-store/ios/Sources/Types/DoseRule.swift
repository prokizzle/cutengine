import Foundation

/// A single dosing rule within a Schedule. Maps to one row in the dose timeline.
public struct DoseRule: Codable, Sendable, Identifiable, Equatable {
    public let id: UUID
    public var compoundID: UUID
    public var scheduleID: UUID
    public var amount: Double
    public var unit: String
    public var cadence: Cadence
    public var timeOfDay: String?
    public var startWeek: Int?
    public var endWeek: Int?
    public var sortOrder: Int
    public var notes: String?

    public enum Cadence: Sendable, Equatable {
        case daily
        case everyNDays(Int)
        case specificDays([Int])
        case cyclical(daysOn: Int, daysOff: Int)
        case everyNHours(Int)
        case asNeeded
    }

    public init(
        id: UUID = UUID(),
        compoundID: UUID,
        scheduleID: UUID,
        amount: Double,
        unit: String = "mg",
        cadence: Cadence = .daily,
        timeOfDay: String? = nil,
        startWeek: Int? = nil,
        endWeek: Int? = nil,
        sortOrder: Int = 0,
        notes: String? = nil
    ) {
        precondition(amount > 0, "Dose amount must be positive")
        if let start = startWeek, let end = endWeek {
            precondition(end >= start, "End week must be on or after start week")
        }
        Self.validate(cadence)

        self.id = id
        self.compoundID = compoundID
        self.scheduleID = scheduleID
        self.amount = amount
        self.unit = unit
        self.cadence = cadence
        self.timeOfDay = timeOfDay
        self.startWeek = startWeek
        self.endWeek = endWeek
        self.sortOrder = sortOrder
        self.notes = notes
    }

    private static func validate(_ cadence: Cadence) {
        switch cadence {
        case .daily, .asNeeded:
            break
        case .everyNDays(let n):
            precondition(n > 0, "Day interval must be positive")
        case .everyNHours(let n):
            precondition(n > 0, "Hour interval must be positive")
        case .cyclical(let daysOn, let daysOff):
            precondition(daysOn > 0 && daysOff > 0, "Cycle days must be positive")
        case .specificDays(let days):
            precondition(!days.isEmpty, "Must specify at least one day")
            precondition(days.allSatisfy { (0 ... 6).contains($0) }, "Days must be 0-6")
        }
    }
}

extension DoseRule.Cadence: Codable {
    private enum CodingKeys: String, CodingKey {
        case type, n, days, daysOn, daysOff
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let type = try container.decode(String.self, forKey: .type)
        switch type {
        case "daily":
            self = .daily
        case "everyNDays":
            self = .everyNDays(try container.decode(Int.self, forKey: .n))
        case "specificDays":
            self = .specificDays(try container.decode([Int].self, forKey: .days))
        case "cyclical":
            self = .cyclical(
                daysOn: try container.decode(Int.self, forKey: .daysOn),
                daysOff: try container.decode(Int.self, forKey: .daysOff)
            )
        case "everyNHours":
            self = .everyNHours(try container.decode(Int.self, forKey: .n))
        case "asNeeded":
            self = .asNeeded
        default:
            throw DecodingError.dataCorruptedError(
                forKey: .type,
                in: container,
                debugDescription: "Unknown cadence type: \(type)"
            )
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .daily:
            try container.encode("daily", forKey: .type)
        case .everyNDays(let n):
            try container.encode("everyNDays", forKey: .type)
            try container.encode(n, forKey: .n)
        case .specificDays(let days):
            try container.encode("specificDays", forKey: .type)
            try container.encode(days, forKey: .days)
        case .cyclical(let daysOn, let daysOff):
            try container.encode("cyclical", forKey: .type)
            try container.encode(daysOn, forKey: .daysOn)
            try container.encode(daysOff, forKey: .daysOff)
        case .everyNHours(let n):
            try container.encode("everyNHours", forKey: .type)
            try container.encode(n, forKey: .n)
        case .asNeeded:
            try container.encode("asNeeded", forKey: .type)
        }
    }
}

/// A container for a set of DoseRules with a name and date range.
public struct Schedule: Codable, Sendable, Identifiable, Equatable {
    public let id: UUID
    public var name: String
    public var startDate: Date
    public var endDate: Date?
    public var rules: [DoseRule]
    public var status: ScheduleStatus

    public enum ScheduleStatus: String, Codable, Sendable, CaseIterable {
        case draft
        case active
        case completed
        case archived
    }

    public init(
        id: UUID = UUID(),
        name: String,
        startDate: Date,
        endDate: Date? = nil,
        rules: [DoseRule] = [],
        status: ScheduleStatus = .draft
    ) {
        if let end = endDate {
            precondition(end >= startDate, "End date must be on or after start date")
        }

        self.id = id
        self.name = name
        self.startDate = startDate
        self.endDate = endDate
        self.rules = rules
        self.status = status
    }
}
