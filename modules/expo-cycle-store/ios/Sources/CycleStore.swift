import Foundation
import SwiftData

/// Persistence layer for cycle/protocol data in the App Group container.
/// CardioEngine reads the same container for shared weight data.
public actor CycleStore {
    public static let shared = CycleStore()

    public static let appGroupIdentifier = "group.com.feelingmindful.shared"

    private var container: ModelContainer?

    private init() {}

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
        let descriptor = FetchDescriptor<CompoundEntity>(
            predicate: #Predicate { $0.id == compound.id }
        )
        if let existing = try ctx.fetch(descriptor).first {
            existing.name = compound.name
            existing.halfLifeHours = compound.halfLifeHours
            existing.defaultUnit = compound.defaultUnit
            existing.defaultRouteRaw = compound.defaultRoute.rawValue
        } else {
            ctx.insert(CompoundEntity(from: compound))
        }
        try ctx.save()
    }

    public func deleteCompound(id: UUID) throws {
        let ctx = ModelContext(try modelContainer)
        let descriptor = FetchDescriptor<CompoundEntity>(
            predicate: #Predicate { $0.id == id }
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
        return entities.map { entity in
            var schedule = entity.toStruct
            schedule.rules = (try? doseRules(for: entity.id)) ?? []
            return schedule
        }
    }

    public func saveSchedule(_ schedule: Schedule) throws {
        let ctx = ModelContext(try modelContainer)
        let descriptor = FetchDescriptor<ScheduleEntity>(
            predicate: #Predicate { $0.id == schedule.id }
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
    }

    // MARK: - Dose Rules

    public func doseRules(for scheduleID: UUID) throws -> [DoseRule] {
        let ctx = ModelContext(try modelContainer)
        let descriptor = FetchDescriptor<DoseRuleEntity>(
            predicate: #Predicate { $0.scheduleID == scheduleID },
            sortBy: [SortDescriptor(\.sortOrder)]
        )
        return try ctx.fetch(descriptor).map(\.toStruct)
    }

    public func saveDoseRules(_ rules: [DoseRule], for scheduleID: UUID) throws {
        let ctx = ModelContext(try modelContainer)
        // Remove existing rules for this schedule
        let existingDescriptor = FetchDescriptor<DoseRuleEntity>(
            predicate: #Predicate { $0.scheduleID == scheduleID }
        )
        for entity in try ctx.fetch(existingDescriptor) {
            ctx.delete(entity)
        }
        // Insert new rules
        for rule in rules {
            ctx.insert(DoseRuleEntity(from: rule))
        }
        try ctx.save()
    }

    // MARK: - Meal Rules

    public func mealRules(for scheduleID: UUID) throws -> [MealRule] {
        let ctx = ModelContext(try modelContainer)
        let descriptor = FetchDescriptor<MealRuleEntity>(
            predicate: #Predicate { $0.scheduleID == scheduleID },
            sortBy: [SortDescriptor(\.sortOrder)]
        )
        return try ctx.fetch(descriptor).map(\.toStruct)
    }

    public func saveMealRule(_ rule: MealRule) throws {
        let ctx = ModelContext(try modelContainer)
        let descriptor = FetchDescriptor<MealRuleEntity>(
            predicate: #Predicate { $0.id == rule.id }
        )
        if let existing = try ctx.fetch(descriptor).first {
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
