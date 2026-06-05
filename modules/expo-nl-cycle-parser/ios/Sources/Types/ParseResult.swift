import Foundation

/// Parsed dosing instructions from NL input.
public struct ParsedRule: Codable, Sendable, Equatable {
    public let token: String
    public let amountMg: Double?
    public let cadenceText: String
    public let daysOfWeek: [Int]?
    public let startWeek: Int?
    public let endWeek: Int?
    public let timeOfDay: String?

    public init(
        token: String,
        amountMg: Double? = nil,
        cadenceText: String,
        daysOfWeek: [Int]? = nil,
        startWeek: Int? = nil,
        endWeek: Int? = nil,
        timeOfDay: String? = nil
    ) {
        self.token = token
        self.amountMg = amountMg
        self.cadenceText = cadenceText
        self.daysOfWeek = daysOfWeek
        self.startWeek = startWeek
        self.endWeek = endWeek
        self.timeOfDay = timeOfDay
    }
}

/// Full parse output — schedule name + parsed rules + tokens→compound map.
public struct ParseResult: Codable, Sendable {
    public let scheduleName: String?
    public let rules: [ParsedRule]
    public let tokenMap: [String: String]

    public init(
        scheduleName: String? = nil,
        rules: [ParsedRule],
        tokenMap: [String: String]
    ) {
        self.scheduleName = scheduleName
        self.rules = rules
        self.tokenMap = tokenMap
    }
}

/// Fallback parse method when LLM is unavailable or refuses.
public enum ParseMethod: String, Codable, Sendable {
    case llm
    case deterministic
}
