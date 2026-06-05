import { Text, TouchableOpacity, View } from "react-native";

type DoseEvent = {
  id: string;
  name: string;
  dose?: number;
  unit?: string;
  timeOfDay: string;
  sortOrder: number;
  taken: boolean;
  regimen?: string;
  weekLabel?: string;
};

const BUCKET_LABELS: Record<string, string> = {
  morning: "MORNING",
  midday: "MIDDAY",
  afternoon: "AFTERNOON",
  withMeals: "WITH MEALS",
  evening: "EVENING",
  bedtime: "BEDTIME",
  anytime: "ANYTIME",
};

const DISPLAY_ORDER = [
  "morning",
  "midday",
  "afternoon",
  "withMeals",
  "evening",
  "bedtime",
  "anytime",
];

export function TimelineSpine({ events }: { events: DoseEvent[] }) {
  const grouped = groupByTimeOfDay(events);

  // Collect unknown bucket keys not in DISPLAY_ORDER for fallback rendering.
  const unknownKeys = Object.keys(grouped).filter(
    (k) => !DISPLAY_ORDER.includes(k)
  );

  return (
    <View className="px-5 mb-8">
      {DISPLAY_ORDER.map((tod) => {
        const items = grouped[tod];
        if (!items?.length) return null;

        return <BucketSection key={tod} tod={tod} items={items} />;
      })}
      {/* Fallback: render unknown time-of-day buckets so no items vanish silently. */}
      {unknownKeys.map((key) => (
        <BucketSection key={key} tod={key} items={grouped[key]!} />
      ))}
    </View>
  );
}

function BucketSection({
  tod,
  items,
}: {
  tod: string;
  items: DoseEvent[];
}) {
  return (
    <View className="mb-5">
      <Text className="text-text-tertiary text-[10px] font-semibold tracking-widest mb-3 ml-1">
        {BUCKET_LABELS[tod] ?? tod.toUpperCase()}
      </Text>
      <View className="bg-surface-secondary rounded-2xl overflow-hidden">
        {items.map((event, index) => (
          <View key={event.id}>
            {index > 0 && <View className="h-px bg-white/5 mx-4" />}
            <DoseRow event={event} />
          </View>
        ))}
      </View>
    </View>
  );
}

function DoseRow({ event }: { event: DoseEvent }) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3.5"
      activeOpacity={0.6}
    >
      {/* Check circle */}
      <View
        className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
          event.taken
            ? "bg-positive border-positive"
            : "border-text-tertiary/30"
        }`}
      >
        {event.taken && (
          <Text className="text-white text-[10px] font-bold">✓</Text>
        )}
      </View>

      {/* Name + dose */}
      <View className="flex-1">
        <View className="flex-row items-baseline gap-2">
          <Text
            className={`text-base ${
              event.taken ? "text-text-tertiary line-through" : "text-text-primary"
            }`}
          >
            {event.name}
          </Text>
          {event.dose != null && (
            <Text className="text-text-tertiary text-sm">
              {event.dose} {event.unit}
            </Text>
          )}
        </View>

        {/* Cycle source chip */}
        {event.regimen && (
          <Text className="text-text-tertiary/50 text-xs mt-0.5">
            {event.regimen}{event.weekLabel ? ` · ${event.weekLabel}` : ""}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function groupByTimeOfDay(
  events: DoseEvent[],
): Record<string, DoseEvent[]> {
  const grouped: Record<string, DoseEvent[]> = {};
  for (const e of events) {
    const key = e.timeOfDay ?? "anytime";
    if (!grouped[key]) grouped[key] = [];
    grouped[key]!.push(e);
  }
  // Sort within each bucket by sortOrder
  for (const key of Object.keys(grouped)) {
    grouped[key]!.sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return grouped;
}
