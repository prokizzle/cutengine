import Foundation
import SwiftData

/// Persistence layer for cycle/protocol data in the App Group container.
/// CardioEngine reads the same container for shared weight data.
///
/// All SwiftData access is serialized through this actor using one shared
/// `ModelContext`, avoiding concurrent context use without `@ModelActor`.
public actor CycleStore {
    public static let shared = CycleStore()

    public static let appGroupIdentifier = "group.com.feelingmindful.shared"

    private var container: ModelContainer?
    private var context: ModelContext?

    init() {}

    /// Fresh in-memory store for isolated unit tests.
    public static func inMemory() async throws -> CycleStore {
        let store = CycleStore()
        try await store.initialize(useInMemory: true)
        return store
    }

    /// Initialize with App Group store (production) or in-memory (tests).
    public func initialize(useInMemory: Bool = false) throws {
        guard container == nil else { return }

        let schema = Schema([
            CompoundEntity.self,
            ScheduleEntity.self,
            DoseRuleEntity.self,
            MealRuleEntity.self,
        ])

        if useInMemory {
            let config = ModelConfiguration(isStoredInMemoryOnly: true)
            container = try ModelContainer(for: schema, configurations: config)
            context = ModelContext(try modelContainer)
            return
        }

        guard let containerURL = FileManager.default
            .containerURL(forSecurityApplicationGroupIdentifier: Self.appGroupIdentifier)
        else {
            throw StoreError.appGroupNotFound
        }

        let storeURL = containerURL.appendingPathComponent("cycle.store")
        let config = ModelConfiguration(
            "CycleStore",
            schema: schema,
            url: storeURL,
            allowsSave: true
        )
        container = try ModelContainer(for: schema, configurations: config)
        context = ModelContext(try modelContainer)
    }

    public var modelContainer: ModelContainer {
        get throws {
            guard let container else { throw StoreError.notInitialized }
            return container
        }
    }

    private func modelContext() throws -> ModelContext {
        if context == nil {
            try initialize()
        }
        guard let context else { throw StoreError.notInitialized }
        return context
    }

    // MARK: - Compounds

    public func allCompounds() throws -> [Compound] {
        let ctx = try modelContext()
        let descriptor = FetchDescriptor<CompoundEntity>(sortBy: [SortDescriptor(\.name)])
        let entities = try ctx.fetch(descriptor)
        return try entities.map { try $0.toStruct() }
    }

    public func saveCompound(_ compound: Compound) throws {
        let ctx = try modelContext()
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
        let ctx = try modelContext()
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
        let ctx = try modelContext()
        let entities = try ctx.fetch(FetchDescriptor<ScheduleEntity>(
            sortBy: [SortDescriptor(\.startDate, order: .reverse)]
        ))
        return try entities.map { entity in
            var schedule = try entity.toStruct()
            schedule.rules = try doseRules(for: entity.id, in: ctx)
            return schedule
        }
    }

    public func saveSchedule(_ schedule: Schedule) throws {
        let ctx = try modelContext()
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
        try replaceDoseRules(schedule.rules, for: scheduleID, in: ctx)
        try ctx.save()
    }

    // MARK: - Dose Rules

    public func doseRules(for scheduleID: UUID) throws -> [DoseRule] {
        let ctx = try modelContext()
        return try doseRules(for: scheduleID, in: ctx)
    }

    private func doseRules(for scheduleID: UUID, in ctx: ModelContext) throws -> [DoseRule] {
        let targetScheduleID = scheduleID
        let descriptor = FetchDescriptor<DoseRuleEntity>(
            predicate: #Predicate { $0.scheduleID == targetScheduleID },
            sortBy: [SortDescriptor(\.sortOrder)]
        )
        return try ctx.fetch(descriptor).map { try $0.toStruct() }
    }

    public func saveDoseRules(_ rules: [DoseRule], for scheduleID: UUID) throws {
        let ctx = try modelContext()
        try replaceDoseRules(rules, for: scheduleID, in: ctx)
        try ctx.save()
    }

    private func replaceDoseRules(
        _ rules: [DoseRule],
        for scheduleID: UUID,
        in ctx: ModelContext
    ) throws {
        let targetScheduleID = scheduleID
        let existingDescriptor = FetchDescriptor<DoseRuleEntity>(
            predicate: #Predicate { $0.scheduleID == targetScheduleID }
        )
        let existing = try ctx.fetch(existingDescriptor)
        var existingByID: [UUID: DoseRuleEntity] = [:]
        for entity in existing {
            if let duplicate = existingByID[entity.id] {
                ctx.delete(duplicate)
            }
            existingByID[entity.id] = entity
        }
        var keptIDs = Set<UUID>()

        for var rule in rules {
            rule.scheduleID = targetScheduleID
            keptIDs.insert(rule.id)
            if let entity = existingByID[rule.id] {
                entity.compoundID = rule.compoundID
                entity.scheduleID = rule.scheduleID
                entity.amount = rule.amount
                entity.unit = rule.unit
                entity.cadenceData = try JSONEncoder().encode(rule.cadence)
                entity.timeOfDay = rule.timeOfDay
                entity.startWeek = rule.startWeek
                entity.endWeek = rule.endWeek
                entity.sortOrder = rule.sortOrder
                entity.notes = rule.notes
            } else {
                ctx.insert(try DoseRuleEntity(from: rule))
            }
        }

        for entity in existing where !keptIDs.contains(entity.id) {
            ctx.delete(entity)
        }
    }

    // MARK: - Meal Rules

    public func mealRules(for scheduleID: UUID) throws -> [MealRule] {
        let ctx = try modelContext()
        let targetScheduleID = scheduleID
        let descriptor = FetchDescriptor<MealRuleEntity>(
            predicate: #Predicate { $0.scheduleID == targetScheduleID },
            sortBy: [SortDescriptor(\.sortOrder)]
        )
        return try ctx.fetch(descriptor).map { $0.toStruct }
    }

    public func saveMealRule(_ rule: MealRule) throws {
        let ctx = try modelContext()
        let ruleID = rule.id
        let descriptor = FetchDescriptor<MealRuleEntity>(
            predicate: #Predicate { $0.id == ruleID }
        )
        if let existing = try ctx.fetch(descriptor).first {
            existing.scheduleID = rule.scheduleID
            existing.label = rule.label
            existing.time = rule.time
            existing.itemsData = try JSONEncoder().encode(rule.items)
            existing.sortOrder = rule.sortOrder
        } else {
            ctx.insert(try MealRuleEntity(from: rule))
        }
        try ctx.save()
    }

    public func deleteMealRule(id: UUID) throws {
        let ctx = try modelContext()
        let ruleID = id
        let descriptor = FetchDescriptor<MealRuleEntity>(
            predicate: #Predicate { $0.id == ruleID }
        )
        if let entity = try ctx.fetch(descriptor).first {
            ctx.delete(entity)
            try ctx.save()
        }
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
