import ExpoModulesCore

/// Expo Module wrapping NLCycleParser for JS consumption.
///
/// JS API:
/// ```ts
/// import ExpoNLCycleParser from "expo-nl-cycle-parser";
/// const result = await ExpoNLCycleParser.parse(
///   "Test E 500mg/wk split Mon/Thu, Anavar 50mg ED wks 1-6",
///   ["Test E", "Anavar"]
/// );
/// // result = { scheduleName, rules: [...], tokenMap: {...}, method: "deterministic" | "llm" }
/// ```
public class ExpoNLCycleParserModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoNLCycleParser")

        AsyncFunction("parse") {
            (input: String, compounds: [String]) -> [String: Any] in

            let (result, method) = await NLCycleParser.shared.parse(
                input,
                compounds: compounds
            )

            return [
                "scheduleName": result.scheduleName as Any,
                "rules": result.rules.map { rule in
                    [
                        "token": rule.token,
                        "amountMg": rule.amountMg as Any,
                        "cadenceText": rule.cadenceText,
                        "daysOfWeek": rule.daysOfWeek as Any,
                        "startWeek": rule.startWeek as Any,
                        "endWeek": rule.endWeek as Any,
                        "timeOfDay": rule.timeOfDay as Any,
                    ] as [String: Any]
                },
                "tokenMap": result.tokenMap,
                "method": method.rawValue,
            ]
        }
    }
}
