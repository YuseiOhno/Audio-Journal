import { StyleSheet, Text, View } from "react-native";
import WaveformBars from "@/features/UI/WaveformBars";

import { RecordButton } from "@/features/recording/components/RecordButton";
import LevelLineDisplay from "@/features/recording/components/LevelLine";
import useRecordingScreenController from "@/features/recording/hooks/useRecordingScreenController";

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

  return (
    <View style={styles.container}>
      <LevelLineDisplay recordingInProgress={recordingInProgress} latestDecibel={latestDecibel} />

      <View style={styles.waveformSection}>
        <View style={styles.waveformRow}>
          <WaveformBars values={waveformValues} targetBars={targetBars} />
        </View>
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
      <View style={styles.bottomSpacer} />
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
    flex: 2,
  },
  waveformRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  statusRow: {
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "flex-start",
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
    alignItems: "flex-end",
  },
  bottomSpacer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingBottom: 16,
  },
});
