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
            let n = try container.decode(Int.self, forKey: .n)
            guard n > 0 else {
                throw DecodingError.dataCorruptedError(
                    forKey: .n,
                    in: container,
                    debugDescription: "Day interval must be positive"
                )
            }
            self = .everyNDays(n)
        case "specificDays":
            let days = try container.decode([Int].self, forKey: .days)
            guard !days.isEmpty, days.allSatisfy({ (0 ... 6).contains($0) }) else {
                throw DecodingError.dataCorruptedError(
                    forKey: .days,
                    in: container,
                    debugDescription: "Days must be non-empty and in 0-6"
                )
            }
            self = .specificDays(days)
        case "cyclical":
            let daysOn = try container.decode(Int.self, forKey: .daysOn)
            let daysOff = try container.decode(Int.self, forKey: .daysOff)
            guard daysOn > 0, daysOff > 0 else {
                throw DecodingError.dataCorruptedError(
                    forKey: .daysOn,
                    in: container,
                    debugDescription: "Cycle days must be positive"
                )
            }
            self = .cyclical(daysOn: daysOn, daysOff: daysOff)
        case "everyNHours":
            let n = try container.decode(Int.self, forKey: .n)
            guard n > 0 else {
                throw DecodingError.dataCorruptedError(
                    forKey: .n,
                    in: container,
                    debugDescription: "Hour interval must be positive"
                )
            }
            self = .everyNHours(n)
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

extension DoseRule {
    private enum CodingKeys: String, CodingKey {
        case id, compoundID, scheduleID, amount, unit, cadence
        case timeOfDay, startWeek, endWeek, sortOrder, notes
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        try self.init(
            id: try container.decode(UUID.self, forKey: .id),
            compoundID: try container.decode(UUID.self, forKey: .compoundID),
            scheduleID: try container.decode(UUID.self, forKey: .scheduleID),
            amount: try container.decode(Double.self, forKey: .amount),
            unit: try container.decode(String.self, forKey: .unit),
            cadence: try container.decode(Cadence.self, forKey: .cadence),
            timeOfDay: try container.decodeIfPresent(String.self, forKey: .timeOfDay),
            startWeek: try container.decodeIfPresent(Int.self, forKey: .startWeek),
            endWeek: try container.decodeIfPresent(Int.self, forKey: .endWeek),
            sortOrder: try container.decode(Int.self, forKey: .sortOrder),
            notes: try container.decodeIfPresent(String.self, forKey: .notes)
        )
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(compoundID, forKey: .compoundID)
        try container.encode(scheduleID, forKey: .scheduleID)
        try container.encode(amount, forKey: .amount)
        try container.encode(unit, forKey: .unit)
        try container.encode(cadence, forKey: .cadence)
        try container.encodeIfPresent(timeOfDay, forKey: .timeOfDay)
        try container.encodeIfPresent(startWeek, forKey: .startWeek)
        try container.encodeIfPresent(endWeek, forKey: .endWeek)
        try container.encode(sortOrder, forKey: .sortOrder)
        try container.encodeIfPresent(notes, forKey: .notes)
    }
}

extension Schedule {
    private enum CodingKeys: String, CodingKey {
        case id, name, startDate, endDate, rules, status
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        try self.init(
            id: try container.decode(UUID.self, forKey: .id),
            name: try container.decode(String.self, forKey: .name),
            startDate: try container.decode(Date.self, forKey: .startDate),
            endDate: try container.decodeIfPresent(Date.self, forKey: .endDate),
            rules: try container.decode([DoseRule].self, forKey: .rules),
            status: try container.decode(ScheduleStatus.self, forKey: .status)
        )
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(name, forKey: .name)
        try container.encode(startDate, forKey: .startDate)
        try container.encodeIfPresent(endDate, forKey: .endDate)
        try container.encode(rules, forKey: .rules)
        try container.encode(status, forKey: .status)
    }
}
