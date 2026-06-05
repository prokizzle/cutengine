import Foundation
import SwiftData

/// Persistence layer for cycle/protocol data in the App Group container.
/// CardioEngine reads the same container for shared weight data.
public actor CycleStore {
    public static let shared = CycleStore()

    public static let appGroupIdentifier = "group.com.feelingmindful.shared"

    private var container: ModelContainer?

    private init() {}

    public func initialize() throws {
        guard container == nil else { return }

        guard let containerURL = FileManager.default
            .containerURL(forSecurityApplicationGroupIdentifier: Self.appGroupIdentifier)
        else {
            throw StoreError.appGroupNotFound
        }

        let storeURL = containerURL.appendingPathComponent("cycle.store")
        let schema = Schema([
            CompoundEntity.self,
            ScheduleEntity.self,
            DoseRuleEntity.self,
            MealRuleEntity.self,
        ])
        let config = ModelConfiguration(
            "CycleStore",
            schema: schema,
            url: storeURL,
            allowsSave: true
        )
        container = try ModelContainer(for: schema, configurations: config)
    }

    public var modelContainer: ModelContainer {
        get throws {
            guard let container else { throw StoreError.notInitialized }
            return container
        }
    }

    // MARK: - Compounds

    public func allCompounds() throws -> [Compound] {
        let ctx = ModelContext(try modelContainer)
        let descriptor = FetchDescriptor<CompoundEntity>(sortBy: [SortDescriptor(\.name)])
        let entities = try ctx.fetch(descriptor)
        return entities.map(\.toStruct)
    }

    public func saveCompound(_ compound: Compound) throws {
        let ctx = ModelContext(try modelContainer)
        let compoundID = compound.id
        let descriptor = FetchDescriptor<CompoundEntity>(
            predicate: #Predicate { $0.id == compoundID }
        )
        if let existing = try ctx.fetch(descriptor).first {
            existing.name = compound.name
            existing.halfLifeHours = compound.halfLifeHours
            existing.defaultUnit = compound.defaultUnit
            existing.defaultRouteRaw = compound.defaultRoute.rawValue
            existing.isUserCreated = compound.isUserCreated
            existing.preSeeded = compound.preSeeded
        } else {
            ctx.insert(CompoundEntity(from: compound))
        }
        try ctx.save()
    }

    public func deleteCompound(id: UUID) throws {
        let ctx = ModelContext(try modelContainer)
        let compoundID = id
        let descriptor = FetchDescriptor<CompoundEntity>(
            predicate: #Predicate { $0.id == compoundID }
        )
        if let entity = try ctx.fetch(descriptor).first {
            ctx.delete(entity)
            try ctx.save()
        }
    }

    // MARK: - Schedules

    public func allSchedules() throws -> [Schedule] {
        let ctx = ModelContext(try modelContainer)
        let entities = try ctx.fetch(FetchDescriptor<ScheduleEntity>(
            sortBy: [SortDescriptor(\.startDate, order: .reverse)]
        ))
        return try entities.map { entity in
            var schedule = entity.toStruct
            schedule.rules = try doseRules(for: entity.id)
            return schedule
        }
    }

    public func saveSchedule(_ schedule: Schedule) throws {
        let ctx = ModelContext(try modelContainer)
        let scheduleID = schedule.id
        let descriptor = FetchDescriptor<ScheduleEntity>(
            predicate: #Predicate { $0.id == scheduleID }
        )
        if let existing = try ctx.fetch(descriptor).first {
            existing.name = schedule.name
            existing.startDate = schedule.startDate
            existing.endDate = schedule.endDate
            existing.statusRaw = schedule.status.rawValue
        } else {
            ctx.insert(ScheduleEntity(from: schedule))
        }
        try ctx.save()
        try saveDoseRules(schedule.rules, for: scheduleID)
    }

    // MARK: - Dose Rules

    public func doseRules(for scheduleID: UUID) throws -> [DoseRule] {
        let ctx = ModelContext(try modelContainer)
        let targetScheduleID = scheduleID
        let descriptor = FetchDescriptor<DoseRuleEntity>(
            predicate: #Predicate { $0.scheduleID == targetScheduleID },
            sortBy: [SortDescriptor(\.sortOrder)]
        )
        return try ctx.fetch(descriptor).map(\.toStruct)
    }

    public func saveDoseRules(_ rules: [DoseRule], for scheduleID: UUID) throws {
        let ctx = ModelContext(try modelContainer)
        let targetScheduleID = scheduleID
        let existingDescriptor = FetchDescriptor<DoseRuleEntity>(
            predicate: #Predicate { $0.scheduleID == targetScheduleID }
        )
        for entity in try ctx.fetch(existingDescriptor) {
            ctx.delete(entity)
        }
        for var rule in rules {
            rule.scheduleID = targetScheduleID
            ctx.insert(DoseRuleEntity(from: rule))
        }
        try ctx.save()
    }

    // MARK: - Meal Rules

    public func mealRules(for scheduleID: UUID) throws -> [MealRule] {
        let ctx = ModelContext(try modelContainer)
        let targetScheduleID = scheduleID
        let descriptor = FetchDescriptor<MealRuleEntity>(
            predicate: #Predicate { $0.scheduleID == targetScheduleID },
            sortBy: [SortDescriptor(\.sortOrder)]
        )
        return try ctx.fetch(descriptor).map(\.toStruct)
    }

    public func saveMealRule(_ rule: MealRule) throws {
        let ctx = ModelContext(try modelContainer)
        let ruleID = rule.id
        let descriptor = FetchDescriptor<MealRuleEntity>(
            predicate: #Predicate { $0.id == ruleID }
        )
        if let existing = try ctx.fetch(descriptor).first {
            existing.scheduleID = rule.scheduleID
            existing.label = rule.label
            existing.time = rule.time
            existing.itemsData = try? JSONEncoder().encode(rule.items)
            existing.sortOrder = rule.sortOrder
        } else {
            ctx.insert(MealRuleEntity(from: rule))
        }
        try ctx.save()
    }
}

public enum StoreError: LocalizedError {
    case appGroupNotFound
    case notInitialized

    public var errorDescription: String? {
        switch self {
        case .appGroupNotFound:
            "App Group '\(CycleStore.appGroupIdentifier)' not found. Check entitlements."
        case .notInitialized:
            "CycleStore not initialized. Call initialize() first."
        }
    }
}
