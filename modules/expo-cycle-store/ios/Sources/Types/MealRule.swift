import Foundation

/// A meal checklist rule tied to a schedule.
public struct MealRule: Codable, Sendable, Identifiable, Equatable {
    public let id: UUID
    public var scheduleID: UUID
    public var label: String
    public var time: String
    public var items: [MealItem]
    public var sortOrder: Int

    public init(
        id: UUID = UUID(),
        scheduleID: UUID,
        label: String,
        time: String,
        items: [MealItem] = [],
        sortOrder: Int = 0
    ) {
        self.id = id
        self.scheduleID = scheduleID
        self.label = label
        self.time = time
        self.items = items
        self.sortOrder = sortOrder
    }
}

/// A single item within a meal checklist entry.
public struct MealItem: Codable, Sendable, Identifiable, Equatable {
    public let id: UUID
    public var name: String
    public var quantity: String
    public var sortOrder: Int

    public init(
        id: UUID = UUID(),
        name: String,
        quantity: String = "",
        sortOrder: Int = 0
    ) {
        self.id = id
        self.name = name
        self.quantity = quantity
        self.sortOrder = sortOrder
    }
}

/// Today's expanded dose/meal event for UI rendering.
public struct TodayEvent: Codable, Sendable, Identifiable, Equatable {
    public let id: UUID
    public var name: String
    public var dose: Double?
    public var unit: String?
    public var timeOfDay: String?
    public var isMeal: Bool
    public var sortOrder: Int
    public var taken: Bool
    public var scheduleName: String?
    public var weekLabel: String?

    public init(
        id: UUID = UUID(),
        name: String,
        dose: Double? = nil,
        unit: String? = nil,
        timeOfDay: String? = nil,
        isMeal: Bool = false,
        sortOrder: Int = 0,
        taken: Bool = false,
        scheduleName: String? = nil,
        weekLabel: String? = nil
    ) {
        self.id = id
        self.name = name
        self.dose = dose
        self.unit = unit
        self.timeOfDay = timeOfDay
        self.isMeal = isMeal
        self.sortOrder = sortOrder
        self.taken = taken
        self.scheduleName = scheduleName
        self.weekLabel = weekLabel
    }
}
