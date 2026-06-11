import { View } from "react-native";
import type { DoseEvent } from "../../types/timeline";
import { selectTimelineRenderOrder } from "../../selectors/timeline";
import { BucketSection } from "./BucketSection";

type Props = {
  events: DoseEvent[];
};

export function TimelineSpine({ events }: Props) {
  const { orderedBuckets, grouped } = selectTimelineRenderOrder(events);

  return (
    <View className="px-5 mb-8">
      {orderedBuckets.map((tod) => (
        <BucketSection key={tod} tod={tod} items={grouped[tod]!} />
      ))}
    </View>
  );
}
