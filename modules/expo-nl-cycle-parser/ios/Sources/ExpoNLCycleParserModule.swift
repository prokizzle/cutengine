import ExpoModulesCore

private func bridgeOptional<T>(_ value: T?) -> Any {
    value.map { $0 as Any } ?? NSNull()
}

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
                "scheduleName": bridgeOptional(result.scheduleName),
                "rules": result.rules.map { rule in
                    [
                        "token": rule.token,
                        "amountMg": bridgeOptional(rule.amountMg),
                        "cadenceText": rule.cadenceText,
                        "daysOfWeek": bridgeOptional(rule.daysOfWeek),
                        "startWeek": bridgeOptional(rule.startWeek),
                        "endWeek": bridgeOptional(rule.endWeek),
                        "timeOfDay": bridgeOptional(rule.timeOfDay),
                    ] as [String: Any]
                },
                "tokenMap": result.tokenMap as [String: Any],
                "method": method.rawValue,
            ]
        }
    }
}
