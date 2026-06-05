import Foundation

/// Tokenizes compound names in NL input so the LLM sees only opaque tokens.
/// Compound identity stays in the client DB — the LLM never sees banned terms.
public enum Tokenizer {
    /// Replaces known compound names with opaque tokens.
    /// Returns (tokenizedText, tokenMap) where tokenMap maps token → original name.
    public static func tokenize(
        _ input: String,
        compounds: [String]
    ) -> (text: String, map: [String: String]) {
        var text = input
        var map: [String: String] = [String: String]()
        var index = 1

        // Sort by length descending so longer names match first (e.g. "Test E" before "Test")
        let sorted = compounds.sorted { $0.count > $1.count }

        for compound in sorted {
            let token = "[tok\(index)]"
            // Case-insensitive replacement
            if let range = text.range(of: compound, options: .caseInsensitive) {
                text.replaceSubrange(range, with: token)
                map[token] = compound
                index += 1
            }
        }

        return (text, map)
    }

    /// Resolves tokens back to compound names in parsed rules.
    public static func resolve(
        rules: [ParsedRule],
        tokenMap: [String: String]
    ) -> [ParsedRule] {
        rules.map { rule in
            var resolved = rule
            return ParsedRule(
                token: tokenMap[rule.token] ?? rule.token,
                amountMg: rule.amountMg,
                cadenceText: rule.cadenceText,
                daysOfWeek: rule.daysOfWeek,
                startWeek: rule.startWeek,
                endWeek: rule.endWeek,
                timeOfDay: rule.timeOfDay
            )
        }
    }
}
