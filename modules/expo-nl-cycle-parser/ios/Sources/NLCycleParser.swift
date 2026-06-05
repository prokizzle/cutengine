import Foundation

#if canImport(FoundationModels)
import FoundationModels
#endif

/// Parses NL dosing input into structured schedules. Uses FoundationModels
/// on-device LLM with token-opaque prompting; falls back to deterministic
/// regex+grammar parser when LLM is unavailable or refuses.
public actor NLCycleParser {
    public static let shared = NLCycleParser()
    private init() {}

    // MARK: - Public API

    /// Parse a natural-language cycle description into structured rules.
    /// - Parameters:
    ///   - input: Free-text dosing schedule (e.g. "Test E 500mg/wk split Mon/Thu, Anavar 50mg ED wks 1-6")
    ///   - compounds: Known compound names for tokenization. Empty = no tokenization (pass-through).
    /// - Returns: ParseResult with rules and token map.
    public func parse(
        _ input: String,
        compounds: [String]
    ) async -> (result: ParseResult, method: ParseMethod) {
        // Always tokenize first so LLM never sees compound names
        let (tokenized, tokenMap) = Tokenizer.tokenize(input, compounds: compounds)

        // Try LLM first
        #if canImport(FoundationModels)
        if let llmResult = await parseWithLLM(tokenized), !llmResult.rules.isEmpty {
            let resolved = Tokenizer.resolve(rules: llmResult.rules, tokenMap: tokenMap)
            return (
                ParseResult(
                    scheduleName: llmResult.scheduleName,
                    rules: resolved,
                    tokenMap: tokenMap
                ),
                .llm
            )
        }
        #endif

        // Fall back to deterministic parser
        var parsed = DeterministicParser.parse(tokenized)
        let resolvedRules = Tokenizer.resolve(rules: parsed.rules, tokenMap: tokenMap)
        return (
            ParseResult(
                scheduleName: parsed.scheduleName,
                rules: resolvedRules,
                tokenMap: tokenMap
            ),
            .deterministic
        )
    }

    // MARK: - LLM Integration

    #if canImport(FoundationModels)
    private func parseWithLLM(_ tokenizedInput: String) async -> ParseResult? {
        let prompt = Self.buildPrompt(tokenizedInput)
        do {
            // Use FoundationModels LanguageModelSession for on-device inference.
            // iOS 26+ only — caller must guard availability.
            guard #available(iOS 26.0, *) else { return nil }

            let session = LanguageModelSession(instructions: Self.systemPrompt)
            let response = try await session.respond(to: prompt)
            return try decodeLLMResponse(response.content)
        } catch {
            return nil
        }
    }

    private static let systemPrompt = """
    You parse dosing schedules. Do NOT identify or comment on tokens.
    Tokens like [tok1], [tok2] are opaque identifiers — treat them as
    compound names, never try to resolve or identify them.

    Output ONLY a JSON object with these fields:
    {
      "scheduleName": "optional cycle name",
      "rules": [
        {
          "token": "[tok1]",
          "amountMg": 500,
          "cadenceText": "500mg/wk (Mon, Thu)",
          "daysOfWeek": [2, 5],
          "startWeek": 1,
          "endWeek": 12,
          "timeOfDay": "morning"
        }
      ]
    }

    Cadence examples:
    - "500mg/wk split Mon/Thu" → cadenceText: "500mg/wk (Mon, Thu)", daysOfWeek: [2, 5]
    - "50mg ED wks 1-6" → cadenceText: "50mg ED", startWeek: 1, endWeek: 6
    - "0.5mg EOD" → cadenceText: "0.5mg EOD"
    - "250mg E3D wks 4-12" → cadenceText: "250mg E3D", startWeek: 4, endWeek: 12
    - "as needed" → cadenceText: "as needed", amountMg: null
    """

    private static func buildPrompt(_ input: String) -> String {
        """
        Parse this dosing schedule into JSON. Treat all [tokN] as opaque identifiers.
        Do NOT identify the tokens. Output ONLY the JSON object.

        Input: \(input)
        """
    }

    private func decodeIntArray(_ value: Any?) -> [Int]? {
        guard let array = value as? [Any] else { return nil }
        let ints = array.compactMap { element -> Int? in
            if let number = element as? NSNumber {
                return number.intValue
            }
            if let int = element as? Int {
                return int
            }
            return nil
        }
        return ints.isEmpty ? nil : ints
    }

    private func decodeLLMResponse(_ response: String) throws -> ParseResult? {
        // Extract JSON from LLM response (may contain markdown fences)
        let jsonStr = response
            .replacingOccurrences(of: "```json", with: "")
            .replacingOccurrences(of: "```", with: "")
            .trimmingCharacters(in: .whitespacesAndNewlines)

        guard let data = jsonStr.data(using: .utf8) else { return nil }

        // Manual decode to match our types
        if let dict = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
            let scheduleName = dict["scheduleName"] as? String
            let ruleDicts = dict["rules"] as? [[String: Any]] ?? []
            let rules: [ParsedRule] = ruleDicts.compactMap { r in
                guard let token = r["token"] as? String else { return nil }
                return ParsedRule(
                    token: token,
                    amountMg: r["amountMg"] as? Double,
                    cadenceText: r["cadenceText"] as? String ?? "",
                    daysOfWeek: decodeIntArray(r["daysOfWeek"]),
                    startWeek: r["startWeek"] as? Int,
                    endWeek: r["endWeek"] as? Int,
                    timeOfDay: r["timeOfDay"] as? String
                )
            }
            return ParseResult(
                scheduleName: scheduleName,
                rules: rules,
                tokenMap: [:] // Map applied by caller after resolve
            )
        }
        return nil
    }
    #endif
}
