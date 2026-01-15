import { Button, Alert, Text, View } from "react-native";
import { useAudioPlayer, AudioModule, setAudioModeAsync } from "expo-audio";
import { useMemo, useEffect } from "react";
import { RecordButton } from "@/components/RecordButton";
import useAudioRecorderHook from "@/hooks/useAudioRecorderHook";

export default function Index() {
  const { audioUri, recordingInProgress, startRecording, stopRecording, remainingSecondsText } =
    useAudioRecorderHook();

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
    <View style={{ padding: 16, gap: 12, backgroundColor: "#B5B6B6", flex: 1 }}>
      <Text style={{ fontSize: 16 }}>
        状態：{recordingInProgress ? "録音中" : audioUri ? "録音済み" : "待機"}
      </Text>

      <Text style={{ fontSize: 40, fontWeight: "800" }}>{remainingSecondsText}</Text>

      <RecordButton
        isRecording={recordingInProgress}
        onStart={() => startRecording()}
        onStop={() => stopRecording()}
      />

      <Button title="再生" onPress={play} disabled={!audioUri || recordingInProgress} />

      {/* <Button title="リセット" onPress={() => setAudioUri(null)} /> */}

      {audioUri ? <Text style={{ fontSize: 12, color: "#666" }}>URI: {audioUri}</Text> : null}
    </View>
  );
}
