import { Button, Alert, Text, View } from "react-native";
import { useAudioPlayer, AudioModule, setAudioModeAsync } from "expo-audio";
import { useMemo, useEffect } from "react";
import { RecordButton } from "@/components/RecordButton";
import WaveformDisplay from "@/components/WaveformDisplay";
import LevelLineDisplay from "@/components/LevelLineDisplay";
import useAudioRecorderHook from "@/hooks/useAudioRecorderHook";

export default function Index() {
  const {
    audioUri,
    recordingInProgress,
    startRecording,
    stopRecording,
    remainingSecondsText,
    latestDecibel,
  } = useAudioRecorderHook();

  const playerSource = useMemo(() => audioUri ?? null, [audioUri]);
  const player = useAudioPlayer(playerSource, { updateInterval: 250 });

  //マイク権限
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("マイク権限が必要です", "設定でマイクを許可してください。");
        return;
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  //再生関数
  const play = () => {
    if (!audioUri) return;
    player.seekTo(0);
    player.play();
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, backgroundColor: "#B5B6B6" }}>
      <LevelLineDisplay recordingInProgress={recordingInProgress} latestDecibel={latestDecibel} />

      <View style={{ flex: 2 }}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-end" }}>
          <WaveformDisplay
            recordingInProgress={recordingInProgress}
            latestDecibel={latestDecibel}
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
          onStart={() => startRecording()}
          onStop={() => stopRecording()}
        />
      </View>
      {/* <Button title="再生" onPress={play} disabled={!audioUri || recordingInProgress} /> */}
      {/* <Button title="リセット" onPress={() => setAudioUri(null)} /> */}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "flex-end",
          paddingBottom: 16,
        }}
      >
        {audioUri ? <Text style={{ fontSize: 12, color: "#666" }}>URI: {audioUri}</Text> : null}
      </View>
    </View>
  );
}
