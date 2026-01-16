import { Alert } from "react-native";
import { useAudioRecorder, RecordingPresets, useAudioRecorderState } from "expo-audio";
import { useState, useEffect, useRef } from "react";
import { useSmoothCountdown } from "@/hooks/useSmoothCountdown";

const MAX_MS = 30000;

export default function Index() {
  const [audioUri, setAudioUri] = useState<string | null>(null);

  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const recorderState = useAudioRecorderState(recorder, 100);
  const latestDecibel = useRef<number | null>(null);

  //残り秒の計算
  const { remainingSecondsText } = useSmoothCountdown(
    recorderState.durationMillis,
    MAX_MS,
    recorderState.isRecording
  );

  //最新のdb値を参照、30秒で自動停止
  useEffect(() => {
    if (!recorderState.isRecording) return;
    if (recorderState.metering != null) {
      latestDecibel.current = recorderState.metering;
    }
    if ((recorderState.durationMillis ?? 0) >= MAX_MS) {
      stopRecording().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorderState.isRecording, recorderState.durationMillis]);

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

  return {
    audioUri,
    recordingInProgress: recorderState.isRecording,
    startRecording,
    stopRecording,
    remainingSecondsText,
    latestDecibel,
  };
}
