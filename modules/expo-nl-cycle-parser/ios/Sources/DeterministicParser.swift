import Foundation

/// Regex + grammar parser for dosing schedules. Used as fallback when
/// FoundationModels LLM is unavailable or refuses the input.
public enum DeterministicParser {
    // Matches: "[tok1] 500mg/wk split Mon/Thu"
    private static let doseLinePattern =
        #/(?:^|,\s*|;\s*|\n|:\s*)\s*(\[tok\d+\])\s*(\d+(?:\.\d+)?)\s*(mg|g|IU|mcg|ml)\s*[/]\s*(wk|week)\s*(?:split\s+(\w+(?:[/]\w+)*))?(?:\s+wks?\s+(\d+)(?:\s*[-–]\s*(\d+))?)?/#

    // Matches: "50mg ED wks 1-6"
    private static let edPattern =
        #/(?:^|,\s*|;\s*|\n|:\s*)\s*(\[tok\d+\])\s*(\d+(?:\.\d+)?)\s*(mg|g|IU|mcg|ml)\s+ED\s*(?:wks?\s+(\d+)(?:\s*[-–]\s*(\d+))?)?/#

    // Matches: "0.5mg EOD" or "250mg E3D"
    private static let intervalPattern =
        #/(?:^|,\s*|;\s*|\n|:\s*)\s*(\[tok\d+\])\s*(\d+(?:\.\d+)?)\s*(mg|g|IU|mcg|ml)\s+E(?:OD|(\d+)D)\s*(?:wks?\s+(\d+)(?:\s*[-–]\s*(\d+))?)?/#

    // Matches: "as needed"
    private static let asNeededPattern =
        #/(?:^|,\s*|;\s*|\n|:\s*)\s*(\[tok\d+\])\s*as\s+needed/#

    private static let scheduleNamePattern = #/^([^.].+?)(?:\s*:\s*)/#

    public static func parse(_ input: String) -> ParseResult {
        let name = scheduleName(from: input)
        var rules: [ParsedRule] = []

        // Try each pattern; remove matched substrings to avoid double-matching
        var remaining = input

        // Extract dose lines
        for match in remaining.matches(of: doseLinePattern) {
            let token = String(match.1)
            let amount = Double(match.2)
            let unit = String(match.3)
            let daysStr = match.5.map(String.init) ?? ""
            let days = parseWeekdays(daysStr)
            let startWeek = match.6.map { Int($0) ?? 1 }
            let endWeek = match.7.map { Int($0) ?? startWeek }

            let cadenceText = days.isEmpty ? "\(amount ?? 0)\(unit)/wk" : "\(amount ?? 0)\(unit)/wk \(daysStr)"
            rules.append(ParsedRule(
                token: token,
                amountMg: amount.map { normalizeToMg($0, unit: unit) },
                cadenceText: cadenceText,
                daysOfWeek: days.isEmpty ? nil : days,
                startWeek: startWeek ?? 1,
                endWeek: endWeek
            ))
            // Remove matched portion
            if let range = remaining.range(of: match.0) {
                remaining.replaceSubrange(range, with: "")
            }
        }

        // Extract ED patterns
        for match in remaining.matches(of: edPattern) {
            let token = String(match.1)
            let amount = Double(match.2)
            let unit = String(match.3)
            let startWeek = match.4.map { Int($0) ?? 1 }
            let endWeek = match.5.map { Int($0) ?? startWeek }

            rules.append(ParsedRule(
                token: token,
                amountMg: amount.map { normalizeToMg($0, unit: unit) },
                cadenceText: "ED",
                daysOfWeek: nil,
                startWeek: startWeek ?? 1,
                endWeek: endWeek
            ))
        }

        // Extract EOD/E<n>D patterns
        for match in remaining.matches(of: intervalPattern) {
            let token = String(match.1)
            let amount = Double(match.2)
            let unit = String(match.3)
            let intervalDays = match.4.flatMap { Int($0) } ?? 2
            let startWeek = match.5.map { Int($0) ?? 1 }
            let endWeek = match.6.map { Int($0) ?? startWeek }

            let label = intervalDays == 2 ? "EOD" : "E\(intervalDays)D"
            rules.append(ParsedRule(
                token: token,
                amountMg: amount.map { normalizeToMg($0, unit: unit) },
                cadenceText: label,
                daysOfWeek: nil,
                startWeek: startWeek ?? 1,
                endWeek: endWeek
            ))
        }

        // Extract as-needed
        for match in remaining.matches(of: asNeededPattern) {
            let token = String(match.1)
            rules.append(ParsedRule(
                token: token,
                amountMg: nil,
                cadenceText: "as needed",
                daysOfWeek: nil,
                startWeek: 1,
                endWeek: nil
            ))
        }

        // Build token map from any remaining tokens
        var tokenMap: [String: String] = [String: String]()
        let allTokens = rules.map(\.token) + input.matches(of: #/\[tok\d+\]/#).map { String($0.0) }
        for token in Set(allTokens) {
            tokenMap[token] = token
        }

        return ParseResult(scheduleName: name, rules: rules, tokenMap: tokenMap)
    }

    // MARK: - Helpers

    private static func scheduleName(from input: String) -> String? {
        guard let match = input.firstMatch(of: scheduleNamePattern) else { return nil }
        return String(match.1).trimmingCharacters(in: .whitespaces)
    }

    private static func parseWeekdays(_ str: String) -> [Int] {
        let dayMap: [String: Int] = [
            "mon": 2, "tue": 3, "wed": 4, "thu": 5, "fri": 6, "sat": 7, "sun": 1,
            "monday": 2, "tuesday": 3, "wednesday": 4, "thursday": 5, "friday": 6, "saturday": 7, "sunday": 1,
        ]
        return str
            .lowercased()
            .split(separator: "/")
            .compactMap { dayMap[String($0)] }
    }

    private static func normalizeToMg(_ amount: Double, unit: String) -> Double {
        switch unit.lowercased() {
        case "g": return amount * 1000
        case "mcg": return amount / 1000
        default: return amount // mg, IU, ml pass through
        }
    }
}
