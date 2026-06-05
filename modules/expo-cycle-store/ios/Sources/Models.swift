import Foundation
import SwiftData

/// SwiftData entity for Compound.
@Model
public final class CompoundEntity {
    @Attribute(.unique) public var id: UUID
    public var name: String
    public var halfLifeHours: Double?
    public var defaultUnit: String
    public var defaultRouteRaw: String
    public var isUserCreated: Bool
    public var preSeeded: Bool

    public init(from compound: Compound) {
        self.id = compound.id
        self.name = compound.name
        self.halfLifeHours = compound.halfLifeHours
        self.defaultUnit = compound.defaultUnit
        self.defaultRouteRaw = compound.defaultRoute.rawValue
        self.isUserCreated = compound.isUserCreated
        self.preSeeded = compound.preSeeded
    }

    public func toStruct() throws -> Compound {
        try Compound(
            id: id,
            name: name,
            halfLifeHours: halfLifeHours,
            defaultUnit: defaultUnit,
            defaultRoute: Compound.Route(rawValue: defaultRouteRaw) ?? .oral,
            isUserCreated: isUserCreated,
            preSeeded: preSeeded
        )
    }
}

/// SwiftData entity for Schedule.
@Model
public final class ScheduleEntity {
    @Attribute(.unique) public var id: UUID
    public var name: String
    public var startDate: Date
    public var endDate: Date?
    public var statusRaw: String

    public init(from schedule: Schedule) {
        self.id = schedule.id
        self.name = schedule.name
        self.startDate = schedule.startDate
        self.endDate = schedule.endDate
        self.statusRaw = schedule.status.rawValue
    }

    public func toStruct() throws -> Schedule {
        try Schedule(
            id: id,
            name: name,
            startDate: startDate,
            endDate: endDate,
            rules: [],
            status: Schedule.ScheduleStatus(rawValue: statusRaw) ?? .draft
        )
    }
}

/// SwiftData entity for DoseRule.
@Model
public final class DoseRuleEntity {
    @Attribute(.unique) public var id: UUID
    public var compoundID: UUID
    public var scheduleID: UUID
    public var amount: Double
    public var unit: String
    public var cadenceData: Data?
    public var timeOfDay: String?
    public var startWeek: Int?
    public var endWeek: Int?
    public var sortOrder: Int
    public var notes: String?

    public init(from rule: DoseRule) throws {
        self.id = rule.id
        self.compoundID = rule.compoundID
        self.scheduleID = rule.scheduleID
        self.amount = rule.amount
        self.unit = rule.unit
        self.cadenceData = try JSONEncoder().encode(rule.cadence)
        self.timeOfDay = rule.timeOfDay
        self.startWeek = rule.startWeek
        self.endWeek = rule.endWeek
        self.sortOrder = rule.sortOrder
        self.notes = rule.notes
    }

    public var cadence: DoseRule.Cadence {
        guard let data = cadenceData,
              let decoded = try? JSONDecoder().decode(DoseRule.Cadence.self, from: data)
        else { return .daily }
        return decoded
    }

    public func toStruct() throws -> DoseRule {
        try DoseRule(
            id: id,
            compoundID: compoundID,
            scheduleID: scheduleID,
            amount: amount,
            unit: unit,
            cadence: cadence,
            timeOfDay: timeOfDay,
            startWeek: startWeek,
            endWeek: endWeek,
            sortOrder: sortOrder,
            notes: notes
        )
    }
}

/// SwiftData entity for MealRule.
@Model
public final class MealRuleEntity {
    @Attribute(.unique) public var id: UUID
    public var scheduleID: UUID
    public var label: String
    public var time: String
    public var itemsData: Data?
    public var sortOrder: Int

    public init(from rule: MealRule) throws {
        self.id = rule.id
        self.scheduleID = rule.scheduleID
        self.label = rule.label
        self.time = rule.time
        self.itemsData = try JSONEncoder().encode(rule.items)
        self.sortOrder = rule.sortOrder
    }

    public var items: [MealItem] {
        guard let data = itemsData,
              let decoded = try? JSONDecoder().decode([MealItem].self, from: data)
        else { return [] }
        return decoded.sorted { $0.sortOrder < $1.sortOrder }
    }

    public var toStruct: MealRule {
        MealRule(
            id: id,
            scheduleID: scheduleID,
            label: label,
            time: time,
            items: items,
            sortOrder: sortOrder
        )
    }
}
