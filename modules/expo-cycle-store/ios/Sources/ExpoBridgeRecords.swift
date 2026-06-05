import ExpoModulesCore
import Foundation

enum BridgeConversionError: LocalizedError {
    case invalidUUID(String)
    case invalidDate(String)
    case invalidCadence(String)
    case invalidAmount(Double)
    case invalidWeekRange(start: Int, end: Int)
    case invalidDateRange(start: String, end: String)

    var errorDescription: String? {
        switch self {
        case .invalidUUID(let value):
            return "Invalid UUID: \(value)"
        case .invalidDate(let value):
            return "Invalid ISO8601 date: \(value)"
        case .invalidCadence(let value):
            return "Invalid cadence: \(value)"
        case .invalidAmount(let value):
            return "Dose amount must be positive: \(value)"
        case .invalidWeekRange(let start, let end):
            return "End week \(end) must be on or after start week \(start)"
        case .invalidDateRange(let start, let end):
            return "End date \(end) must be on or after start date \(start)"
        }
    }
}

private enum BridgeDate {
    private static let fractionalFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()

    private static let standardFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter
    }()

    static func encode(_ date: Date) -> String {
        fractionalFormatter.string(from: date)
    }

    static func decode(_ value: String) throws -> Date {
        if let date = fractionalFormatter.date(from: value) ?? standardFormatter.date(from: value) {
            return date
        }
        throw BridgeConversionError.invalidDate(value)
    }
}

private func uuid(_ value: String) throws -> UUID {
    guard let id = UUID(uuidString: value) else {
        throw BridgeConversionError.invalidUUID(value)
    }
    return id
}

struct CadenceRecord: Record {
    @Field var type: String = "daily"
    @Field var n: Int?
    @Field var days: [Int]?
    @Field var daysOn: Int?
    @Field var daysOff: Int?

    init() {}

    init(_ cadence: DoseRule.Cadence) {
        switch cadence {
        case .daily:
            type = "daily"
        case .everyNDays(let interval):
            type = "everyNDays"
            n = interval
        case .specificDays(let weekdays):
            type = "specificDays"
            days = weekdays
        case .cyclical(let on, let off):
            type = "cyclical"
            daysOn = on
            daysOff = off
        case .everyNHours(let interval):
            type = "everyNHours"
            n = interval
        case .asNeeded:
            type = "asNeeded"
        }
    }

    func toCadence() throws -> DoseRule.Cadence {
        switch type {
        case "daily":
            return .daily
        case "everyNDays":
            guard let n, n > 0 else { throw BridgeConversionError.invalidCadence(type) }
            return .everyNDays(n)
        case "specificDays":
            guard let days, !days.isEmpty, days.allSatisfy({ (0 ... 6).contains($0) }) else {
                throw BridgeConversionError.invalidCadence(type)
            }
            return .specificDays(days)
        case "cyclical":
            guard let daysOn, let daysOff, daysOn > 0, daysOff > 0 else {
                throw BridgeConversionError.invalidCadence(type)
            }
            return .cyclical(daysOn: daysOn, daysOff: daysOff)
        case "everyNHours":
            guard let n, n > 0 else { throw BridgeConversionError.invalidCadence(type) }
            return .everyNHours(n)
        case "asNeeded":
            return .asNeeded
        default:
            throw BridgeConversionError.invalidCadence(type)
        }
    }
}

struct CompoundRecord: Record {
    @Field var id: String = ""
    @Field var name: String = ""
    @Field var halfLifeHours: Double?
    @Field var defaultUnit: String = "mg"
    @Field var defaultRoute: String = Compound.Route.oral.rawValue
    @Field var isUserCreated: Bool = true
    @Field var preSeeded: Bool = false

    init() {}

    init(_ compound: Compound) {
        id = compound.id.uuidString
        name = compound.name
        halfLifeHours = compound.halfLifeHours
        defaultUnit = compound.defaultUnit
        defaultRoute = compound.defaultRoute.rawValue
        isUserCreated = compound.isUserCreated
        preSeeded = compound.preSeeded
    }

    func toCompound() throws -> Compound {
        Compound(
            id: try uuid(id),
            name: name,
            halfLifeHours: halfLifeHours,
            defaultUnit: defaultUnit,
            defaultRoute: Compound.Route(rawValue: defaultRoute) ?? .oral,
            isUserCreated: isUserCreated,
            preSeeded: preSeeded
        )
    }
}

struct DoseRuleRecord: Record {
    @Field var id: String = ""
    @Field var compoundID: String = ""
    @Field var scheduleID: String = ""
    @Field var amount: Double = 0
    @Field var unit: String = "mg"
    @Field var cadence: CadenceRecord = CadenceRecord()
    @Field var timeOfDay: String?
    @Field var startWeek: Int?
    @Field var endWeek: Int?
    @Field var sortOrder: Int = 0
    @Field var notes: String?

    init() {}

    init(_ rule: DoseRule) {
        id = rule.id.uuidString
        compoundID = rule.compoundID.uuidString
        scheduleID = rule.scheduleID.uuidString
        amount = rule.amount
        unit = rule.unit
        cadence = CadenceRecord(rule.cadence)
        timeOfDay = rule.timeOfDay
        startWeek = rule.startWeek
        endWeek = rule.endWeek
        sortOrder = rule.sortOrder
        notes = rule.notes
    }

    func toDoseRule() throws -> DoseRule {
        guard amount > 0 else { throw BridgeConversionError.invalidAmount(amount) }
        if let start = startWeek, let end = endWeek, end < start {
            throw BridgeConversionError.invalidWeekRange(start: start, end: end)
        }
        return DoseRule(
            id: try uuid(id),
            compoundID: try uuid(compoundID),
            scheduleID: try uuid(scheduleID),
            amount: amount,
            unit: unit,
            cadence: try cadence.toCadence(),
            timeOfDay: timeOfDay,
            startWeek: startWeek,
            endWeek: endWeek,
            sortOrder: sortOrder,
            notes: notes
        )
    }
}

struct ScheduleRecord: Record {
    @Field var id: String = ""
    @Field var name: String = ""
    @Field var startDate: String = ""
    @Field var endDate: String?
    @Field var rules: [DoseRuleRecord] = []
    @Field var status: String = Schedule.ScheduleStatus.draft.rawValue

    init() {}

    init(_ schedule: Schedule) {
        id = schedule.id.uuidString
        name = schedule.name
        startDate = BridgeDate.encode(schedule.startDate)
        endDate = schedule.endDate.map(BridgeDate.encode)
        rules = schedule.rules.map(DoseRuleRecord.init)
        status = schedule.status.rawValue
    }

    func toSchedule() throws -> Schedule {
        let decodedStart = try BridgeDate.decode(startDate)
        let decodedEnd = try endDate.map(BridgeDate.decode)
        if let decodedEnd, decodedEnd < decodedStart {
            throw BridgeConversionError.invalidDateRange(
                start: startDate,
                end: endDate ?? ""
            )
        }
        return Schedule(
            id: try uuid(id),
            name: name,
            startDate: decodedStart,
            endDate: decodedEnd,
            rules: try rules.map { try $0.toDoseRule() },
            status: Schedule.ScheduleStatus(rawValue: status) ?? .draft
        )
    }
}

struct MealItemRecord: Record {
    @Field var id: String = ""
    @Field var name: String = ""
    @Field var quantity: String = ""
    @Field var sortOrder: Int = 0

    init() {}

    init(_ item: MealItem) {
        id = item.id.uuidString
        name = item.name
        quantity = item.quantity
        sortOrder = item.sortOrder
    }

    func toMealItem() throws -> MealItem {
        MealItem(
            id: try uuid(id),
            name: name,
            quantity: quantity,
            sortOrder: sortOrder
        )
    }
}

struct MealRuleRecord: Record {
    @Field var id: String = ""
    @Field var scheduleID: String = ""
    @Field var label: String = ""
    @Field var time: String = ""
    @Field var items: [MealItemRecord] = []
    @Field var sortOrder: Int = 0

    init() {}

    init(_ rule: MealRule) {
        id = rule.id.uuidString
        scheduleID = rule.scheduleID.uuidString
        label = rule.label
        time = rule.time
        items = rule.items.map(MealItemRecord.init)
        sortOrder = rule.sortOrder
    }

    func toMealRule() throws -> MealRule {
        MealRule(
            id: try uuid(id),
            scheduleID: try uuid(scheduleID),
            label: label,
            time: time,
            items: try items.map { try $0.toMealItem() },
            sortOrder: sortOrder
        )
    }
}
