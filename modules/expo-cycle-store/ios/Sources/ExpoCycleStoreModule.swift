import ExpoModulesCore

/// Expo Module wrapping CycleStore CRUD for JS consumption.
///
/// JS API (auto-generated types from Swift signatures):
/// ```ts
/// import ExpoCycleStore from "expo-cycle-store";
/// await ExpoCycleStore.initialize();
/// const compounds = await ExpoCycleStore.getAllCompounds();
/// await ExpoCycleStore.saveCompound({ id, name, ... });
/// ```
public class ExpoCycleStoreModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoCycleStore")

        AsyncFunction("initialize") { () in
            try await CycleStore.shared.initialize()
        }

        // MARK: - Compounds

        AsyncFunction("getAllCompounds") { () -> [Compound] in
            try await CycleStore.shared.allCompounds()
        }

        AsyncFunction("saveCompound") { (compound: Compound) in
            try await CycleStore.shared.saveCompound(compound)
        }

        AsyncFunction("deleteCompound") { (id: String) in
            guard let uuid = UUID(uuidString: id) else {
                throw InvalidArgsError(id: id)
            }
            try await CycleStore.shared.deleteCompound(id: uuid)
        }

        // MARK: - Schedules

        AsyncFunction("getAllSchedules") { () -> [Schedule] in
            try await CycleStore.shared.allSchedules()
        }

        AsyncFunction("saveSchedule") { (schedule: Schedule) in
            try await CycleStore.shared.saveSchedule(schedule)
        }

        // MARK: - Dose Rules

        AsyncFunction("getDoseRules") { (scheduleID: String) -> [DoseRule] in
            guard let uuid = UUID(uuidString: scheduleID) else {
                throw InvalidArgsError(id: scheduleID)
            }
            return try await CycleStore.shared.doseRules(for: uuid)
        }

        AsyncFunction("saveDoseRules") { (rules: [DoseRule], scheduleID: String) in
            guard let uuid = UUID(uuidString: scheduleID) else {
                throw InvalidArgsError(id: scheduleID)
            }
            try await CycleStore.shared.saveDoseRules(rules, for: uuid)
        }

        // MARK: - Meal Rules

        AsyncFunction("getMealRules") { (scheduleID: String) -> [MealRule] in
            guard let uuid = UUID(uuidString: scheduleID) else {
                throw InvalidArgsError(id: scheduleID)
            }
            return try await CycleStore.shared.mealRules(for: uuid)
        }

        AsyncFunction("saveMealRule") { (rule: MealRule) in
            try await CycleStore.shared.saveMealRule(rule)
        }
    }
}

struct InvalidArgsError: LocalizedError {
    let id: String
    var errorDescription: String? { "Invalid UUID: \(id)" }
}
