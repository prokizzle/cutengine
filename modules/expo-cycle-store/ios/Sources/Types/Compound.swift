import Foundation

/// A substance tracked in a cycle protocol.
/// Mirrors `Substance` in CutEngine but decoupled from SwiftData.
public struct Compound: Codable, Sendable, Identifiable, Equatable {
    public let id: UUID
    public var name: String
    public var halfLifeHours: Double?
    public var defaultUnit: String
    public var defaultRoute: Route
    public var isUserCreated: Bool
    public var preSeeded: Bool

    public enum Route: String, Codable, Sendable, CaseIterable {
        case oral
        case injectable
        case topical
        case sublingual
        case nasal
        case other
    }

    public init(
        id: UUID = UUID(),
        name: String,
        halfLifeHours: Double? = nil,
        defaultUnit: String = "mg",
        defaultRoute: Route = .oral,
        isUserCreated: Bool = true,
        preSeeded: Bool = false
    ) {
        precondition(!name.isEmpty, "Compound name cannot be empty")
        precondition(!defaultUnit.isEmpty, "Default unit cannot be empty")
        if let halfLife = halfLifeHours {
            precondition(halfLife > 0, "Half-life must be positive")
        }

        self.id = id
        self.name = name
        self.halfLifeHours = halfLifeHours
        self.defaultUnit = defaultUnit
        self.defaultRoute = defaultRoute
        self.isUserCreated = isUserCreated
        self.preSeeded = preSeeded
    }
}

extension Compound {
    private enum CodingKeys: String, CodingKey {
        case id, name, halfLifeHours, defaultUnit, defaultRoute, isUserCreated, preSeeded
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        try self.init(
            id: try container.decode(UUID.self, forKey: .id),
            name: try container.decode(String.self, forKey: .name),
            halfLifeHours: try container.decodeIfPresent(Double.self, forKey: .halfLifeHours),
            defaultUnit: try container.decode(String.self, forKey: .defaultUnit),
            defaultRoute: try container.decode(Route.self, forKey: .defaultRoute),
            isUserCreated: try container.decode(Bool.self, forKey: .isUserCreated),
            preSeeded: try container.decode(Bool.self, forKey: .preSeeded)
        )
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(name, forKey: .name)
        try container.encodeIfPresent(halfLifeHours, forKey: .halfLifeHours)
        try container.encode(defaultUnit, forKey: .defaultUnit)
        try container.encode(defaultRoute, forKey: .defaultRoute)
        try container.encode(isUserCreated, forKey: .isUserCreated)
        try container.encode(preSeeded, forKey: .preSeeded)
    }
}
