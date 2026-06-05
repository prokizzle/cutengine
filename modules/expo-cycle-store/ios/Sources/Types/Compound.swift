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
    ) throws {
        try Self.validate(name: name, halfLifeHours: halfLifeHours, defaultUnit: defaultUnit)
        self.id = id
        self.name = name
        self.halfLifeHours = halfLifeHours
        self.defaultUnit = defaultUnit
        self.defaultRoute = defaultRoute
        self.isUserCreated = isUserCreated
        self.preSeeded = preSeeded
    }

    private static func validate(name: String, halfLifeHours: Double?, defaultUnit: String) throws {
        guard !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            throw ValidationError.emptyName
        }
        guard !defaultUnit.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            throw ValidationError.emptyDefaultUnit
        }
        if let halfLife = halfLifeHours, halfLife <= 0 {
            throw ValidationError.invalidHalfLife
        }
    }

    enum ValidationError: Error, CustomStringConvertible {
        case emptyName
        case emptyDefaultUnit
        case invalidHalfLife

        var description: String {
            switch self {
            case .emptyName: "Compound name cannot be empty"
            case .emptyDefaultUnit: "Default unit cannot be empty"
            case .invalidHalfLife: "Half-life must be positive"
            }
        }
    }
}

extension Compound {
    private enum CodingKeys: String, CodingKey {
        case id, name, halfLifeHours, defaultUnit, defaultRoute, isUserCreated, preSeeded
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        do {
            try self.init(
                id: try container.decode(UUID.self, forKey: .id),
                name: try container.decode(String.self, forKey: .name),
                halfLifeHours: try container.decodeIfPresent(Double.self, forKey: .halfLifeHours),
                defaultUnit: try container.decode(String.self, forKey: .defaultUnit),
                defaultRoute: try container.decode(Route.self, forKey: .defaultRoute),
                isUserCreated: try container.decode(Bool.self, forKey: .isUserCreated),
                preSeeded: try container.decode(Bool.self, forKey: .preSeeded)
            )
        } catch let error as ValidationError {
            throw DecodingError.dataCorrupted(
                DecodingError.Context(codingPath: container.codingPath, debugDescription: error.description)
            )
        }
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
