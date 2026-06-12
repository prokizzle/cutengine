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

    private func decodedCadence() throws -> DoseRule.Cadence {
        guard let data = cadenceData else {
            throw StoreError.missingCadenceData(ruleID: id)
        }
        do {
            return try JSONDecoder().decode(DoseRule.Cadence.self, from: data)
        } catch {
            throw StoreError.invalidCadenceData(ruleID: id)
        }
    }

    public func toStruct() throws -> DoseRule {
        try DoseRule(
            id: id,
            compoundID: compoundID,
            scheduleID: scheduleID,
            amount: amount,
            unit: unit,
            cadence: try decodedCadence(),
            timeOfDay: timeOfDay,
            startWeek: startWeek,
            endWeek: endWeek,
            sortOrder: sortOrder,
            notes: notes
        )
    }
}

/// SwiftData entity for the UserProfile singleton.
@Model
public final class UserProfileEntity {
    @Attribute(.unique) public var id: String
    public var currentPhaseRaw: String
    public var phaseStartDate: Date
    public var macroOverridesData: Data?
    public var targetWeightDeltaPerWeekKg: Double

    public init(from profile: UserProfile) throws {
        self.id = profile.id
        self.currentPhaseRaw = profile.currentPhase.rawValue
        self.phaseStartDate = profile.phaseStartDate
        self.macroOverridesData = try JSONEncoder().encode(profile.macroOverrides)
        self.targetWeightDeltaPerWeekKg = profile.targetWeightDeltaPerWeekKg
    }

    private func decodedMacroOverrides() throws -> [Phase: MacroRatio] {
        guard let data = macroOverridesData else { return [:] }
        do {
            return try JSONDecoder().decode([Phase: MacroRatio].self, from: data)
        } catch {
            throw StoreError.invalidUserProfileData
        }
    }

    public func toStruct() throws -> UserProfile {
        guard let currentPhase = Phase(rawValue: currentPhaseRaw) else {
            throw StoreError.invalidUserProfileData
        }
        return UserProfile(
            id: id,
            currentPhase: currentPhase,
            phaseStartDate: phaseStartDate,
            macroOverrides: try decodedMacroOverrides(),
            targetWeightDeltaPerWeekKg: targetWeightDeltaPerWeekKg
        )
    }
}

/// SwiftData entity for BiofeedbackEntry.
@Model
public final class BiofeedbackEntryEntity {
    @Attribute(.unique) public var id: UUID
    public var date: Date
    public var phaseRaw: String
    public var answersData: Data?

    public init(from entry: BiofeedbackEntry) throws {
        self.id = entry.id
        self.date = entry.date
        self.phaseRaw = entry.phase.rawValue
        self.answersData = try JSONEncoder().encode(entry.answers)
    }

    private func decodedAnswers() throws -> [BiofeedbackAnswer] {
        guard let data = answersData else {
            throw StoreError.missingAnswersData(entryID: id)
        }
        do {
            return try JSONDecoder().decode([BiofeedbackAnswer].self, from: data)
        } catch {
            throw StoreError.invalidAnswersData(entryID: id)
        }
    }

    public func toStruct() throws -> BiofeedbackEntry {
        guard let phase = Phase(rawValue: phaseRaw) else {
            throw StoreError.invalidBiofeedbackEntry(reason: "Entry \(id) has invalid phase '\(phaseRaw)'")
        }
        return BiofeedbackEntry(
            id: id,
            date: date,
            phase: phase,
            answers: try decodedAnswers()
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

    private func decodedItems() throws -> [MealItem] {
        guard let data = itemsData else {
            throw StoreError.missingItemsData(ruleID: id)
        }
        do {
            return try JSONDecoder().decode([MealItem].self, from: data)
                .sorted { $0.sortOrder < $1.sortOrder }
        } catch {
            throw StoreError.invalidItemsData(ruleID: id)
        }
    }

    public func toStruct() throws -> MealRule {
        try MealRule(
            id: id,
            scheduleID: scheduleID,
            label: label,
            time: time,
            items: decodedItems(),
            sortOrder: sortOrder
        )
    }
}
