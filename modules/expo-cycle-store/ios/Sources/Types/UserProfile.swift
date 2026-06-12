import Foundation

/// Diet phase the user is currently running.
public enum Phase: String, Codable, Sendable, CaseIterable {
    case cut
    case bulk
    case maintenance
}

/// Macro split expressed as fractions of total calories (each 0..1).
public struct MacroRatio: Codable, Sendable, Equatable {
    public var protein: Double
    public var carb: Double
    public var fat: Double

    public init(protein: Double, carb: Double, fat: Double) {
        self.protein = protein
        self.carb = carb
        self.fat = fat
    }

    public var sum: Double { protein + carb + fat }

    public var allFinite: Bool {
        protein.isFinite && carb.isFinite && fat.isFinite
    }
}

/// Singleton user profile: phase mode, macro overrides, weekly weight-delta target.
/// HealthKit remains the source of truth for bodyMass — none of that lives here.
public struct UserProfile: Codable, Sendable, Equatable {
    public static let singletonID = "user-profile-singleton"

    /// Built-in per-phase macro defaults (not stored).
    public static let defaultMacros: [Phase: MacroRatio] = [
        .cut: MacroRatio(protein: 0.40, carb: 0.30, fat: 0.30),
        .bulk: MacroRatio(protein: 0.30, carb: 0.45, fat: 0.25),
        .maintenance: MacroRatio(protein: 0.30, carb: 0.40, fat: 0.30),
    ]

    public let id: String
    public var currentPhase: Phase
    public var phaseStartDate: Date
    public var macroOverrides: [Phase: MacroRatio]
    /// Signed kg/week: negative = cut, positive = bulk, ~0 = maintenance.
    public var targetWeightDeltaPerWeekKg: Double

    public init(
        id: String = UserProfile.singletonID,
        currentPhase: Phase,
        phaseStartDate: Date,
        macroOverrides: [Phase: MacroRatio] = [:],
        targetWeightDeltaPerWeekKg: Double
    ) {
        self.id = id
        self.currentPhase = currentPhase
        self.phaseStartDate = phaseStartDate
        self.macroOverrides = macroOverrides
        self.targetWeightDeltaPerWeekKg = targetWeightDeltaPerWeekKg
    }

    /// Default singleton inserted on first fetch. -0.5 kg/week ≈ 1 lb/week cut.
    public static func makeDefault(now: Date = Date()) -> UserProfile {
        UserProfile(
            currentPhase: .cut,
            phaseStartDate: now,
            macroOverrides: [:],
            targetWeightDeltaPerWeekKg: -0.5
        )
    }

    /// Override if present for `phase`, else the built-in default.
    public func macroRatio(for phase: Phase) -> MacroRatio {
        macroOverrides[phase] ?? Self.defaultMacros[phase]!
    }

    public func validate() throws {
        for (phase, ratio) in macroOverrides {
            guard ratio.allFinite else {
                throw StoreError.invalidUserProfile(
                    reason: "Macro override for \(phase.rawValue) contains a non-finite ratio"
                )
            }
            guard (0 ... 1).contains(ratio.protein),
                  (0 ... 1).contains(ratio.carb),
                  (0 ... 1).contains(ratio.fat)
            else {
                throw StoreError.invalidUserProfile(
                    reason: "Macro override for \(phase.rawValue) has a ratio outside 0...1"
                )
            }
            guard (0.99 ... 1.01).contains(ratio.sum) else {
                throw StoreError.invalidUserProfile(
                    reason: "Macro override for \(phase.rawValue) sums to \(ratio.sum); expected 0.99–1.01"
                )
            }
        }
        guard targetWeightDeltaPerWeekKg.isFinite,
              (-1.5 ... 1.5).contains(targetWeightDeltaPerWeekKg)
        else {
            throw StoreError.invalidUserProfile(
                reason: "targetWeightDeltaPerWeekKg \(targetWeightDeltaPerWeekKg) outside [-1.5, 1.5]"
            )
        }
    }
}
