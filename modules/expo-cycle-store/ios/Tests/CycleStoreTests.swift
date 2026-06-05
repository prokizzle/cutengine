import Foundation
import Testing
@testable import ExpoCycleStore

@Suite("CycleStore")
struct CycleStoreTests {

    // MARK: - Compounds

    @Test("save and retrieve compounds")
    func compoundCRUD() async throws {
        let store = try CycleStore.inMemory()

        let compound = Compound(
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
        let store = try CycleStore.inMemory()

        let compound = Compound(name: "Test Compound", defaultUnit: "mg")
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
        let store = try CycleStore.inMemory()

        let schedule = Schedule(name: "Test Cycle", startDate: Date())
        try await store.saveSchedule(schedule)

        let rules = [
            DoseRule(
                compoundID: UUID(),
                scheduleID: schedule.id,
                amount: 500,
                unit: "mg",
                cadence: .specificDays([2, 5]),
                timeOfDay: "morning",
                sortOrder: 0
            ),
            DoseRule(
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
        let store = try CycleStore.inMemory()

        let scheduleID = UUID()
        let schedule = Schedule(id: scheduleID, name: "Meal Plan", startDate: Date())
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
    func compoundRouteRoundtrip() {
        let routes: [Compound.Route] = [.oral, .injectable, .topical, .sublingual, .nasal, .other]
        for route in routes {
            let compound = Compound(name: "Test", defaultRoute: route)
            #expect(compound.defaultRoute == route)
            #expect(Compound.Route(rawValue: route.rawValue) == route)
        }
    }
}
