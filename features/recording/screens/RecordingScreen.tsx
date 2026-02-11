import { StyleSheet, Text, View } from "react-native";
import WaveformBars from "@/features/UI/WaveformBars";

import { RecordButton } from "@/features/recording/components/RecordButton";
import LevelLine from "@/features/recording/components/LevelLine";
import useRecordingScreenController from "@/features/recording/hooks/useRecordingScreenController";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RecordingScreen() {
  const {
    recordingInProgress,
    remainingSecondsText,
    latestDecibel,
    targetBars,
    waveformValues,
    onPressRecord,
    disabled,
  } = useRecordingScreenController();

  const { top } = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LevelLine
        recordingInProgress={recordingInProgress}
        latestDecibel={latestDecibel}
        topInset={top}
      />

      <View style={styles.waveformSection}>
        <WaveformBars values={waveformValues} targetBars={targetBars} />
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>{remainingSecondsText}</Text>
          <Text style={styles.statusText}>{latestDecibel.current?.toFixed(1) ?? "- ∞"} db</Text>
        </View>
      </View>
      <View style={styles.recordButton}>
        <RecordButton
          isRecording={recordingInProgress}
          onPress={onPressRecord}
          disabled={disabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
    backgroundColor: "#B5B6B6",
  },
  waveformSection: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "column",
    marginTop: 20,
  },
  statusRow: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 10,
  },
  statusText: {
    fontSize: 15,
    fontWeight: "400",
    color: "#333333",
  },
  recordButton: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
  },
});
