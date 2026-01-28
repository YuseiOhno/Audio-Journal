import { Alert } from "react-native";
import { useAudioRecorder, RecordingPresets, useAudioRecorderState } from "expo-audio";
import { useState, useEffect, useRef } from "react";
import { useSmoothCountdown } from "@/hooks/useSmoothCountdown";
import useFetchLocationOnce from "@/hooks/useFetchLocationOnce";

const MAX_MS = 30000;
const sampleIntervalMs = 200;

export default function Index() {
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number | null;
  } | null>(null);

  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const recorderState = useAudioRecorderState(recorder, sampleIntervalMs);
  const latestDecibel = useRef<number | null>(null);
  const { fetchLocationOnce } = useFetchLocationOnce();

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
      const now = new Date();
      const iso = now.toISOString();
      setCreatedAt(iso);
      setDateKey(iso.slice(0, 10));
      setAudioUri(null);
      const locationPromise = fetchLocationOnce();
      await recorder.prepareToRecordAsync();
      recorder.record();
      const loc = await locationPromise;
      if (loc.ok) {
        setLocation({ lat: loc.lat, lng: loc.lng, accuracy: loc.accuracy });
      } else {
        setLocation(null);
      }
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
      setDurationMs(recorderState.durationMillis ?? 0);
    } catch (e: any) {
      Alert.alert("録音停止に失敗しました", String(e?.message ?? e));
    }
  };

  const resetRecording = () => {
    setAudioUri(null);
    setCreatedAt(null);
    setDateKey(null);
    setDurationMs(null);
    setLocation(null);
  };

  return {
    audioUri,
    recordingInProgress: recorderState.isRecording,
    startRecording,
    stopRecording,
    remainingSecondsText,
    latestDecibel,
    location,
    createdAt,
    dateKey,
    durationMs,
    resetRecording,
    MAX_MS,
    sampleIntervalMs,
  };
}
