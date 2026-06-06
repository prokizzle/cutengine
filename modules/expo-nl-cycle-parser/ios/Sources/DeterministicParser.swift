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
    private static let tokenPlaceholderPattern = #/^\[tok\d+\]$/#

    public static func parse(_ input: String, tokenMap: [String: String] = [:]) -> ParseResult {
        let name = scheduleName(from: input)
        var rules: [ParsedRule] = []

        // Try each pattern; remove matched substrings to avoid double-matching
        var remaining = input

        // Extract dose lines (firstMatch loop — safe while mutating remaining)
        while let match = remaining.firstMatch(of: doseLinePattern) {
            let token = String(match.1)
            let amount = Double(match.2)
            let unit = String(match.3)
            let daysStr = match.5.map(String.init) ?? ""
            let days = parseWeekdays(daysStr)
            let startWeek = match.6.flatMap { Int($0) }
            let endWeek = match.7.flatMap { Int($0) }

            let cadenceText = days.isEmpty ? "\(amount ?? 0)\(unit)/wk" : "\(amount ?? 0)\(unit)/wk \(daysStr)"
            rules.append(ParsedRule(
                token: token,
                amountMg: amount.map { normalizeToMg($0, unit: unit) },
                cadenceText: cadenceText,
                daysOfWeek: days.isEmpty ? nil : days,
                startWeek: startWeek,
                endWeek: endWeek
            ))
            remaining.replaceSubrange(match.range, with: "")
        }

        // Extract ED patterns
        for match in remaining.matches(of: edPattern) {
            let token = String(match.1)
            let amount = Double(match.2)
            let unit = String(match.3)
            let startWeek = match.4.flatMap { Int($0) }
            let endWeek = match.5.flatMap { Int($0) }

            rules.append(ParsedRule(
                token: token,
                amountMg: amount.map { normalizeToMg($0, unit: unit) },
                cadenceText: "ED",
                daysOfWeek: nil,
                startWeek: startWeek,
                endWeek: endWeek
            ))
        }

        // Extract EOD/E<n>D patterns
        for match in remaining.matches(of: intervalPattern) {
            let token = String(match.1)
            let amount = Double(match.2)
            let unit = String(match.3)
            let intervalDays = match.4.flatMap { Int($0) } ?? 2
            let startWeek = match.5.flatMap { Int($0) }
            let endWeek = match.6.flatMap { Int($0) }

            let label = intervalDays == 2 ? "EOD" : "E\(intervalDays)D"
            rules.append(ParsedRule(
                token: token,
                amountMg: amount.map { normalizeToMg($0, unit: unit) },
                cadenceText: label,
                daysOfWeek: nil,
                startWeek: startWeek,
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
                startWeek: nil,
                endWeek: nil
            ))
        }

        return ParseResult(scheduleName: name, rules: rules, tokenMap: tokenMap)
    }

    // MARK: - Helpers

    private static func scheduleName(from input: String) -> String? {
        guard let match = input.firstMatch(of: scheduleNamePattern) else { return nil }
        let name = String(match.1).trimmingCharacters(in: .whitespaces)
        guard name.firstMatch(of: tokenPlaceholderPattern) == nil else { return nil }
        return name
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
