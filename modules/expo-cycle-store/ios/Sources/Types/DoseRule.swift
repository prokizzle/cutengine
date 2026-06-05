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

    public enum Cadence: Codable, Sendable, Equatable {
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
        self.id = id
        self.name = name
        self.startDate = startDate
        self.endDate = endDate
        self.rules = rules
        self.status = status
    }
}
