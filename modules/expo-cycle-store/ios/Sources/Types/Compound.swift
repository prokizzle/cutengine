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
        self.id = id
        self.name = name
        self.halfLifeHours = halfLifeHours
        self.defaultUnit = defaultUnit
        self.defaultRoute = defaultRoute
        self.isUserCreated = isUserCreated
        self.preSeeded = preSeeded
    }
}
