import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { DoseEvent } from "../../types/timeline";
import { selectTimelineRenderOrder } from "../../selectors/timeline";
import { BucketSection } from "./BucketSection";

type Props = {
  events: DoseEvent[];
};

export function TimelineSpine({ events }: Props) {
  const { orderedBuckets, grouped } = selectTimelineRenderOrder(events);

  return (
    <View style={styles.container}>
      {orderedBuckets.map((tod) => (
        <BucketSection key={tod} tod={tod} items={grouped[tod]!} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  container: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
}));
