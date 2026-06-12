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
            UserProfileEntity.self,
            BiofeedbackEntryEntity.self,
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

    /// Initialize over an existing container — a second store sharing the same
    /// backing data, the same shape CardioEngine uses against the App Group.
    public func initialize(container existing: ModelContainer) {
        guard container == nil else { return }
        container = existing
        context = ModelContext(existing)
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
        let existing = try ctx.fetch(descriptor).first
        if let existing {
            existing.name = schedule.name
            existing.startDate = schedule.startDate
            existing.endDate = schedule.endDate
            existing.statusRaw = schedule.status.rawValue
        } else {
            ctx.insert(ScheduleEntity(from: schedule))
        }
        // Omitting or passing empty rules on an existing schedule preserves dose rules.
        // To clear or replace rules, call saveDoseRules([], scheduleID) or saveDoseRules(rules, scheduleID).
        if !schedule.rules.isEmpty || existing == nil {
            try replaceDoseRules(schedule.rules, for: scheduleID, in: ctx)
        }
        try ctx.save()
    }

    public func deleteSchedule(id: UUID) throws {
        let ctx = try modelContext()
        let scheduleID = id
        let descriptor = FetchDescriptor<ScheduleEntity>(
            predicate: #Predicate { $0.id == scheduleID }
        )
        guard let entity = try ctx.fetch(descriptor).first else { return }

        try replaceDoseRules([], for: scheduleID, in: ctx)

        let mealDescriptor = FetchDescriptor<MealRuleEntity>(
            predicate: #Predicate { $0.scheduleID == scheduleID }
        )
        for meal in try ctx.fetch(mealDescriptor) {
            ctx.delete(meal)
        }

        ctx.delete(entity)
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

        for entity in existingByID.values where !keptIDs.contains(entity.id) {
            ctx.delete(entity)
        }
    }

    // MARK: - User Profile

    /// Returns the singleton profile, inserting the default on first fetch.
    /// Never returns nil — eliminates a nullable branch at every consumer.
    public func userProfile() throws -> UserProfile {
        let ctx = try modelContext()
        if let existing = try fetchUserProfileEntity(in: ctx) {
            return try existing.toStruct()
        }
        let profile = UserProfile.makeDefault()
        ctx.insert(try UserProfileEntity(from: profile))
        try ctx.save()
        return profile
    }

    /// Whether the singleton row exists yet (without creating it).
    /// Used by the app to decide if first-launch onboarding should run.
    public func hasUserProfile() throws -> Bool {
        let ctx = try modelContext()
        return try fetchUserProfileEntity(in: ctx) != nil
    }

    /// Validates and persists the singleton. The stored row always uses
    /// `UserProfile.singletonID` regardless of the id on the incoming value.
    public func saveUserProfile(_ profile: UserProfile) throws {
        try profile.validate()
        let ctx = try modelContext()
        if let existing = try fetchUserProfileEntity(in: ctx) {
            existing.currentPhaseRaw = profile.currentPhase.rawValue
            existing.phaseStartDate = profile.phaseStartDate
            existing.macroOverridesData = try JSONEncoder().encode(profile.macroOverrides)
            existing.targetWeightDeltaPerWeekKg = profile.targetWeightDeltaPerWeekKg
        } else {
            var normalized = profile
            if profile.id != UserProfile.singletonID {
                normalized = UserProfile(
                    currentPhase: profile.currentPhase,
                    phaseStartDate: profile.phaseStartDate,
                    macroOverrides: profile.macroOverrides,
                    targetWeightDeltaPerWeekKg: profile.targetWeightDeltaPerWeekKg
                )
            }
            ctx.insert(try UserProfileEntity(from: normalized))
        }
        try ctx.save()
    }

    private func fetchUserProfileEntity(in ctx: ModelContext) throws -> UserProfileEntity? {
        let singletonID = UserProfile.singletonID
        let descriptor = FetchDescriptor<UserProfileEntity>(
            predicate: #Predicate { $0.id == singletonID }
        )
        return try ctx.fetch(descriptor).first
    }

    // MARK: - Biofeedback

    public func allBiofeedbackEntries() throws -> [BiofeedbackEntry] {
        let ctx = try modelContext()
        let descriptor = FetchDescriptor<BiofeedbackEntryEntity>(
            sortBy: [SortDescriptor(\.date, order: .reverse)]
        )
        return try ctx.fetch(descriptor).map { try $0.toStruct() }
    }

    public func saveBiofeedbackEntry(_ entry: BiofeedbackEntry) throws {
        try entry.validate()
        let ctx = try modelContext()
        let entryID = entry.id
        let descriptor = FetchDescriptor<BiofeedbackEntryEntity>(
            predicate: #Predicate { $0.id == entryID }
        )
        if let existing = try ctx.fetch(descriptor).first {
            existing.date = entry.date
            existing.phaseRaw = entry.phase.rawValue
            existing.answersData = try JSONEncoder().encode(entry.answers)
        } else {
            ctx.insert(try BiofeedbackEntryEntity(from: entry))
        }
        try ctx.save()
    }

    public func deleteBiofeedbackEntry(id: UUID) throws {
        let ctx = try modelContext()
        let entryID = id
        let descriptor = FetchDescriptor<BiofeedbackEntryEntity>(
            predicate: #Predicate { $0.id == entryID }
        )
        if let entity = try ctx.fetch(descriptor).first {
            ctx.delete(entity)
            try ctx.save()
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
        return try ctx.fetch(descriptor).map { try $0.toStruct() }
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
    case missingCadenceData(ruleID: UUID)
    case invalidCadenceData(ruleID: UUID)
    case missingItemsData(ruleID: UUID)
    case invalidItemsData(ruleID: UUID)
    case invalidUserProfile(reason: String)
    case invalidUserProfileData
    case invalidBiofeedbackEntry(reason: String)
    case missingAnswersData(entryID: UUID)
    case invalidAnswersData(entryID: UUID)

    public var errorDescription: String? {
        switch self {
        case .appGroupNotFound:
            "App Group '\(CycleStore.appGroupIdentifier)' not found. Check entitlements."
        case .notInitialized:
            "CycleStore not initialized. Call initialize() first."
        case .missingCadenceData(let ruleID):
            "Dose rule \(ruleID) is missing cadence data."
        case .invalidCadenceData(let ruleID):
            "Dose rule \(ruleID) has invalid cadence data."
        case .missingItemsData(let ruleID):
            "Meal rule \(ruleID) is missing items data."
        case .invalidItemsData(let ruleID):
            "Meal rule \(ruleID) has invalid items data."
        case .invalidUserProfile(let reason):
            "Invalid user profile: \(reason)"
        case .invalidUserProfileData:
            "User profile has invalid macro overrides data."
        case .invalidBiofeedbackEntry(let reason):
            "Invalid biofeedback entry: \(reason)"
        case .missingAnswersData(let entryID):
            "Biofeedback entry \(entryID) is missing answers data."
        case .invalidAnswersData(let entryID):
            "Biofeedback entry \(entryID) has invalid answers data."
        }
    }
}
