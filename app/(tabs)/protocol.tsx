import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProtocolScreen() {
  const [input, setInput] = useState("");
  return (
    <SafeAreaView className="flex-1 bg-surface-primary">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="text-text-primary text-2xl font-bold mb-1">New Cycle</Text>
        <Text className="text-text-secondary text-sm mb-5">Paste a dosing schedule in plain English.</Text>
        <TextInput
          className="bg-surface-secondary rounded-xl p-4 text-text-primary text-base min-h-[160px] leading-5"
          placeholder="Test E 500mg/wk split Mon/Thu\nAnavar 50mg ED wks 1-6\nArimidex 0.5mg EOD"
          placeholderTextColor="#8e8e93" multiline textAlignVertical="top"
          value={input} onChangeText={setInput}
        />
        <TouchableOpacity className="bg-positive rounded-xl py-3.5 mt-4 items-center" onPress={() => Alert.alert("TODO", "NLCycleParser integration")}>
          <Text className="text-white font-semibold text-base">Parse Schedule</Text>
        </TouchableOpacity>
        <View className="mt-8 bg-surface-secondary rounded-2xl p-4">
          <Text className="text-text-tertiary text-xs mb-2">PREVIOUS CYCLES</Text>
          <Text className="text-text-secondary text-sm">No cycles yet. Create your first one above.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
