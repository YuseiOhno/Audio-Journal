import { Text, View } from "react-native";
import WaveformBars from "@/features/UI/WaveformBars";

import { RecordButton } from "@/features/recording/components/RecordButton";
import LevelLineDisplay from "@/features/recording/components/LevelLineDisplay";
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
    <View style={{ flex: 1, padding: 16, gap: 12, backgroundColor: "#B5B6B6" }}>
      <LevelLineDisplay recordingInProgress={recordingInProgress} latestDecibel={latestDecibel} />

      <View style={{ flex: 2 }}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-end" }}>
          <WaveformBars
            values={waveformValues}
            targetBars={targetBars}
            containerStyle={{ borderRadius: 25 }}
            barStyle={{ borderRadius: 2 }}
          />
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "400", color: "#333333" }}>
            {remainingSecondsText}
          </Text>
          <Text style={{ fontSize: 15, fontWeight: "400", color: "#333333" }}>
            {latestDecibel.current?.toFixed(1)} db
          </Text>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          flexDirection: "row",
          alignItems: "flex-end",
        }}
      >
        <RecordButton
          isRecording={recordingInProgress}
          onPress={onPressRecord}
          disabled={disabled}
        />
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "flex-end",
          paddingBottom: 16,
        }}
      ></View>
    </View>
  );
}
