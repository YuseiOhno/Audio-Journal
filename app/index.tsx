import { Button, Alert, Text, View } from "react-native";
import {
  useAudioRecorder,
  RecordingPresets,
  useAudioRecorderState,
  useAudioPlayer,
  AudioModule,
  setAudioModeAsync,
} from "expo-audio";
import { useMemo, useState, useEffect } from "react";
import { RecordButton } from "@/components/RecordButton";
import { useSmoothCountdown } from "@/hooks/useSmoothCountdown";

const MAX_MS = 30000;

export default function Index() {
  const [audioUri, setAudioUri] = useState<string | null>(null);

  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const recorderState = useAudioRecorderState(recorder, 250);

  const playerSource = useMemo(() => audioUri ?? null, [audioUri]);
  const player = useAudioPlayer(playerSource, { updateInterval: 250 });

  //残り秒の計算
  const { remainingSecondsText } = useSmoothCountdown(
    recorderState.durationMillis,
    MAX_MS,
    recorderState.isRecording
  );

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

  //録音開始
  const startRecording = async () => {
    try {
      setAudioUri(null);
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (e: any) {
      Alert.alert("録音開始に失敗しました", String(e?.message ?? e));
    }
  };

  //録音停止
  const stopRecording = async () => {
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        Alert.alert("録音データが取得できませんでした");
        return;
      }
      setAudioUri(uri);
    } catch (e: any) {
      Alert.alert("録音停止に失敗しました", String(e?.message ?? e));
    }
  };

  //30秒で自動停止
  useEffect(() => {
    if (!recorderState.isRecording) return;
    if ((recorderState.durationMillis ?? 0) >= MAX_MS) {
      stopRecording().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorderState.isRecording, recorderState.durationMillis]);

  //再生関数
  const play = () => {
    if (!audioUri) return;
    player.seekTo(0);
    player.play();
  };

  return (
    <View style={{ padding: 16, gap: 12, backgroundColor: "#B5B6B6", flex: 1 }}>
      <Text style={{ fontSize: 16 }}>
        状態：{recorderState.isRecording ? "録音中" : audioUri ? "録音済み" : "待機"}
      </Text>

      <Text style={{ fontSize: 40, fontWeight: "800" }}>{remainingSecondsText}</Text>

      <RecordButton
        isRecording={recorderState.isRecording}
        onStart={() => startRecording()}
        onStop={() => stopRecording()}
      />

      <Button title="再生" onPress={play} disabled={!audioUri || recorderState.isRecording} />

      <Button title="リセット" onPress={() => setAudioUri(null)} />

      {audioUri ? <Text style={{ fontSize: 12, color: "#666" }}>URI: {audioUri}</Text> : null}
    </View>
  );
}
