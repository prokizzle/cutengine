import Foundation
import Testing
@testable import ExpoCycleStore

@Suite("CycleStore")
struct CycleStoreTests {

    // MARK: - Compounds

    @Test("save and retrieve compounds")
    func compoundCRUD() async throws {
        let store = try await CycleStore.inMemory()

        let compound = try Compound(
            name: "Creatine",
            defaultUnit: "g",
            defaultRoute: .oral
        )
        try await store.saveCompound(compound)

        let all = try await store.allCompounds()
        #expect(all.count == 1)
        #expect(all[0].name == "Creatine")
        #expect(all[0].defaultUnit == "g")

        try await store.deleteCompound(id: compound.id)
        let after = try await store.allCompounds()
        #expect(after.isEmpty)
    }

    @Test("update existing compound")
    func compoundUpdate() async throws {
        let store = try await CycleStore.inMemory()

        let compound = try Compound(name: "Test Compound", defaultUnit: "mg")
        try await store.saveCompound(compound)

        var updated = compound
        updated.name = "Updated Name"
        updated.defaultUnit = "g"
        try await store.saveCompound(updated)

        let all = try await store.allCompounds()
        #expect(all.count == 1)
        #expect(all[0].name == "Updated Name")
        #expect(all[0].defaultUnit == "g")
    }

    // MARK: - Schedules

    @Test("save and retrieve schedule with dose rules")
    func scheduleWithRules() async throws {
        let store = try await CycleStore.inMemory()

        let schedule = try Schedule(name: "Test Cycle", startDate: Date())
        try await store.saveSchedule(schedule)

        let rules = [
            try DoseRule(
                compoundID: UUID(),
                scheduleID: schedule.id,
                amount: 500,
                unit: "mg",
                cadence: .specificDays([2, 5]),
                timeOfDay: "morning",
                sortOrder: 0
            ),
            try DoseRule(
                compoundID: UUID(),
                scheduleID: schedule.id,
                amount: 50,
                unit: "mg",
                cadence: .daily,
                timeOfDay: "evening",
                sortOrder: 1
            ),
        ]
        try await store.saveDoseRules(rules, for: schedule.id)

        let schedules = try await store.allSchedules()
        #expect(schedules.count == 1)
        #expect(schedules[0].rules.count == 2)
        #expect(schedules[0].rules[0].amount == 500)

        if case .specificDays(let days) = schedules[0].rules[0].cadence {
            #expect(days == [2, 5])
        } else {
            #expect(Bool(false), "Expected specificDays cadence")
        }
    }

    // MARK: - Meal Rules

    @Test("save and retrieve meal rules")
    func mealRuleCRUD() async throws {
        let store = try await CycleStore.inMemory()

        let scheduleID = UUID()
        let schedule = try Schedule(id: scheduleID, name: "Meal Plan", startDate: Date())
        try await store.saveSchedule(schedule)

        let mealRule = MealRule(
            scheduleID: scheduleID,
            label: "Breakfast",
            time: "08:00",
            items: [
                MealItem(name: "Eggs", quantity: "3 large"),
                MealItem(name: "Oats", quantity: "1 cup", sortOrder: 1),
            ],
            sortOrder: 0
        )
        try await store.saveMealRule(mealRule)

        let rules = try await store.mealRules(for: scheduleID)
        #expect(rules.count == 1)
        #expect(rules[0].label == "Breakfast")
        #expect(rules[0].items.count == 2)
        #expect(rules[0].items[0].name == "Eggs")
    }

    // MARK: - Compound Route

    @Test("compound route roundtrip")
    func compoundRouteRoundtrip() throws {
        let routes: [Compound.Route] = [.oral, .injectable, .topical, .sublingual, .nasal, .other]
        for route in routes {
            let compound = try Compound(name: "Test", defaultRoute: route)
            #expect(compound.defaultRoute == route)
            #expect(Compound.Route(rawValue: route.rawValue) == route)
        }
    }

    // MARK: - User Profile

    @Test("first fetch creates the default singleton")
    func userProfileDefaultCreation() async throws {
        let store = try await CycleStore.inMemory()

        #expect(try await store.hasUserProfile() == false)

        let profile = try await store.userProfile()
        #expect(profile.id == UserProfile.singletonID)
        #expect(profile.currentPhase == .cut)
        #expect(profile.macroOverrides.isEmpty)
        #expect(profile.targetWeightDeltaPerWeekKg == -0.5)
        #expect(try await store.hasUserProfile() == true)
    }

    @Test("save then fetch round-trips the profile")
    func userProfileRoundTrip() async throws {
        let store = try await CycleStore.inMemory()

        var profile = try await store.userProfile()
        profile.currentPhase = .bulk
        profile.targetWeightDeltaPerWeekKg = 0.25
        profile.macroOverrides[.bulk] = MacroRatio(protein: 0.35, carb: 0.40, fat: 0.25)
        try await store.saveUserProfile(profile)

        let fetched = try await store.userProfile()
        #expect(fetched == profile)
    }

    @Test("second save mutates the same singleton — no duplicate rows")
    func userProfileSingleton() async throws {
        let store = try await CycleStore.inMemory()

        var profile = try await store.userProfile()
        profile.currentPhase = .maintenance
        try await store.saveUserProfile(profile)
        profile.currentPhase = .bulk
        try await store.saveUserProfile(profile)

        let ctx = ModelContext(try await store.modelContainer)
        let rows = try ctx.fetch(FetchDescriptor<UserProfileEntity>())
        #expect(rows.count == 1)
        #expect(try await store.userProfile().currentPhase == .bulk)
    }

    @Test("macroRatio(for:) returns default when absent, override when present")
    func macroRatioDefaultsAndOverrides() throws {
        var profile = UserProfile.makeDefault()
        #expect(profile.macroRatio(for: .cut) == MacroRatio(protein: 0.40, carb: 0.30, fat: 0.30))
        #expect(profile.macroRatio(for: .bulk) == MacroRatio(protein: 0.30, carb: 0.45, fat: 0.25))
        #expect(profile.macroRatio(for: .maintenance) == MacroRatio(protein: 0.30, carb: 0.40, fat: 0.30))

        let override = MacroRatio(protein: 0.45, carb: 0.35, fat: 0.20)
        profile.macroOverrides[.cut] = override
        #expect(profile.macroRatio(for: .cut) == override)
        #expect(profile.macroRatio(for: .bulk) == MacroRatio(protein: 0.30, carb: 0.45, fat: 0.25))
    }

    @Test("invalid macro ratio sum throws invalidUserProfile")
    func invalidRatioSumThrows() async throws {
        let store = try await CycleStore.inMemory()

        var profile = try await store.userProfile()
        profile.macroOverrides[.cut] = MacroRatio(protein: 0.4, carb: 0.4, fat: 0.4)

        await #expect(throws: StoreError.self) {
            try await store.saveUserProfile(profile)
        }
    }

    @Test("non-finite macro ratio throws invalidUserProfile")
    func nonFiniteRatioThrows() async throws {
        let store = try await CycleStore.inMemory()

        var profile = try await store.userProfile()
        profile.macroOverrides[.bulk] = MacroRatio(protein: .nan, carb: 0.45, fat: 0.25)

        await #expect(throws: StoreError.self) {
            try await store.saveUserProfile(profile)
        }
    }

    @Test("weekly delta outside [-1.5, 1.5] throws invalidUserProfile")
    func invalidWeeklyDeltaThrows() async throws {
        let store = try await CycleStore.inMemory()

        var profile = try await store.userProfile()
        profile.targetWeightDeltaPerWeekKg = 10

        await #expect(throws: StoreError.self) {
            try await store.saveUserProfile(profile)
        }
    }

    @Test("second store over the same container observes the saved profile")
    func secondStoreObservesProfile() async throws {
        let store = try await CycleStore.inMemory()

        var profile = try await store.userProfile()
        profile.currentPhase = .bulk
        profile.targetWeightDeltaPerWeekKg = 0.3
        try await store.saveUserProfile(profile)

        let secondStore = CycleStore()
        await secondStore.initialize(container: try await store.modelContainer)

        let observed = try await secondStore.userProfile()
        #expect(observed.currentPhase == .bulk)
        #expect(observed.targetWeightDeltaPerWeekKg == 0.3)
    }

    // MARK: - Biofeedback

    @Test("save and retrieve biofeedback entries, newest first")
    func biofeedbackCRUD() async throws {
        let store = try await CycleStore.inMemory()

        let older = BiofeedbackEntry(
            date: Date(timeIntervalSinceNow: -86_400),
            phase: .cut,
            answers: [BiofeedbackAnswer(questionID: "hunger", prompt: "How was your hunger?", score: 3)]
        )
        let newer = BiofeedbackEntry(
            date: Date(),
            phase: .bulk,
            answers: [
                BiofeedbackAnswer(questionID: "training-intensity", prompt: "Training intensity?", score: 5),
                BiofeedbackAnswer(questionID: "appetite", prompt: "Appetite?", score: 4),
            ]
        )
        try await store.saveBiofeedbackEntry(older)
        try await store.saveBiofeedbackEntry(newer)

        let entries = try await store.allBiofeedbackEntries()
        #expect(entries.count == 2)
        #expect(entries[0].id == newer.id)
        #expect(entries[0].phase == .bulk)
        #expect(entries[0].answers.count == 2)
        #expect(entries[1].answers[0].prompt == "How was your hunger?")

        try await store.deleteBiofeedbackEntry(id: older.id)
        #expect(try await store.allBiofeedbackEntries().count == 1)
    }

    @Test("out-of-range biofeedback score throws")
    func biofeedbackInvalidScoreThrows() async throws {
        let store = try await CycleStore.inMemory()

        let entry = BiofeedbackEntry(
            date: Date(),
            phase: .cut,
            answers: [BiofeedbackAnswer(questionID: "hunger", prompt: "Hunger?", score: 9)]
        )

        await #expect(throws: StoreError.self) {
            try await store.saveBiofeedbackEntry(entry)
        }
    }

    @Test("empty biofeedback answers throws")
    func biofeedbackEmptyAnswersThrows() async throws {
        let store = try await CycleStore.inMemory()

        let entry = BiofeedbackEntry(date: Date(), phase: .cut, answers: [])

        await #expect(throws: StoreError.self) {
            try await store.saveBiofeedbackEntry(entry)
        }
    }
}
