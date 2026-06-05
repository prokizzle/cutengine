import ExpoModulesCore

/// Expo Module wrapping CycleStore CRUD for JS consumption.
public class ExpoCycleStoreModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoCycleStore")

        AsyncFunction("initialize") { () in
            try await CycleStore.shared.initialize()
        }

        // MARK: - Compounds

        AsyncFunction("getAllCompounds") { () -> [CompoundRecord] in
            try await CycleStore.shared.allCompounds().map(CompoundRecord.init)
        }

        AsyncFunction("saveCompound") { (compound: CompoundRecord) in
            try await CycleStore.shared.saveCompound(try compound.toCompound())
        }

        AsyncFunction("deleteCompound") { (id: String) in
            try await CycleStore.shared.deleteCompound(id: try uuid(id))
        }

        // MARK: - Schedules

        AsyncFunction("getAllSchedules") { () -> [ScheduleRecord] in
            try await CycleStore.shared.allSchedules().map(ScheduleRecord.init)
        }

        AsyncFunction("saveSchedule") { (schedule: ScheduleRecord) in
            try await CycleStore.shared.saveSchedule(try schedule.toSchedule())
        }

        // MARK: - Dose Rules

        AsyncFunction("getDoseRules") { (scheduleID: String) -> [DoseRuleRecord] in
            try await CycleStore.shared.doseRules(for: try uuid(scheduleID)).map(DoseRuleRecord.init)
        }

        AsyncFunction("saveDoseRules") { (rules: [DoseRuleRecord], scheduleID: String) in
            let parsedRules = try rules.map { try $0.toDoseRule() }
            try await CycleStore.shared.saveDoseRules(parsedRules, for: try uuid(scheduleID))
        }

        // MARK: - Meal Rules

        AsyncFunction("getMealRules") { (scheduleID: String) -> [MealRuleRecord] in
            try await CycleStore.shared.mealRules(for: try uuid(scheduleID)).map(MealRuleRecord.init)
        }

        AsyncFunction("saveMealRule") { (rule: MealRuleRecord) in
            try await CycleStore.shared.saveMealRule(try rule.toMealRule())
        }
    }
}

private func uuid(_ value: String) throws -> UUID {
    guard let id = UUID(uuidString: value) else {
        throw BridgeConversionError.invalidUUID(value)
    }
    return id
}
