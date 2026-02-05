import { Alert } from "react-native";
import {
  useAudioRecorder,
  RecordingPresets,
  useAudioRecorderState,
  setAudioModeAsync,
  IOSOutputFormat,
  AudioQuality,
} from "expo-audio";
import { useState, useEffect, useRef } from "react";
import { useSmoothCountdown } from "@/features/recording/hooks/useSmoothCountdown";
import useFetchLocationOnce from "@/features/recording/hooks/useFetchLocationOnce";
import { moveRecordingToDocuments } from "@/features/recording/lib/moveRecordingToDocuments";

import { GeoPoint } from "@/core/types/types";

const MAX_MS = 30000;
const sampleIntervalMs = 200;

export default function useAudioRecorderHook() {
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [location, setLocation] = useState<GeoPoint | null>(null);

  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
    numberOfChannels: 2,
    ios: {
      ...RecordingPresets.HIGH_QUALITY.ios,
      extension: ".wav",
      outputFormat: IOSOutputFormat.LINEARPCM,
      audioQuality: AudioQuality.MAX,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
  });
  const recorderState = useAudioRecorderState(recorder, sampleIntervalMs);
  const latestDecibel = useRef<number | null>(null);
  const { fetchLocationOnce } = useFetchLocationOnce();

  //残り秒の計算
  const { remainingSecondsText } = useSmoothCountdown(
    MAX_MS,
    recorderState.isRecording,
    recorderState.durationMillis,
  );

  //最新のdb値を参照、30秒で自動停止
  useEffect(() => {
    if (!recorderState.isRecording) return;
    if (recorderState.metering != null) {
      latestDecibel.current = recorderState.metering;
    }
    if ((recorderState.durationMillis ?? 0) >= MAX_MS) stopRecording();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorderState.isRecording, recorderState.durationMillis]);

  //録音開始
  const startRecording = async () => {
    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
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
        setLocation(loc.location);
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
      const newUri = await moveRecordingToDocuments(uri);
      setAudioUri(newUri);
      setDurationMs(recorderState.durationMillis ?? 0);
    } catch (e: any) {
      Alert.alert("録音停止に失敗しました", String(e?.message ?? e));
    } finally {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
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
