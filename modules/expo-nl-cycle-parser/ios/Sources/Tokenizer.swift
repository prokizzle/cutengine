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
            var searchStart = text.startIndex
            var replaced = false
            while searchStart < text.endIndex,
                  let range = text.range(
                      of: compound,
                      options: .caseInsensitive,
                      range: searchStart ..< text.endIndex
                  ) {
                let startOffset = text.distance(from: text.startIndex, to: range.lowerBound)
                text.replaceSubrange(range, with: token)
                let nextOffset = startOffset + token.count
                searchStart = text.index(
                    text.startIndex,
                    offsetBy: nextOffset,
                    limitedBy: text.endIndex
                ) ?? text.endIndex
                replaced = true
            }
            if replaced {
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
        rules.compactMap { rule in
            let resolvedToken: String
            if let name = tokenMap[rule.token] {
                resolvedToken = name
            } else if rule.token.hasPrefix("[tok"), rule.token.hasSuffix("]") {
                return nil
            } else {
                resolvedToken = rule.token
            }
            return ParsedRule(
                token: resolvedToken,
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
