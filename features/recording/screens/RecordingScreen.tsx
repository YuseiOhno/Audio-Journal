import { Alert, Text, View } from "react-native";
import { AudioModule } from "expo-audio";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";

import { RecordButton } from "@/features/recording/components/RecordButton";
import WaveformDisplay from "@/features/recording/components/WaveformDisplay";
import LevelLineDisplay from "@/features/recording/components/LevelLineDisplay";

import useAudioRecorderHook from "@/features/recording/hooks/useAudioRecorder";

import { useRecordingDraftStore } from "../store/recordingDraftStore";

export default function RecordingScreen() {
  const {
    recordingInProgress,
    currentDurationMs,
    startRecording,
    stopRecording,
    resetRecording,
    remainingSecondsText,
    latestDecibel,
    MAX_MS,
    dateKey,
    createdAt,
    location,
    sampleIntervalMs,
  } = useAudioRecorderHook();

  const router = useRouter();
  const setDraft = useRecordingDraftStore((state) => state.setDraft);
  const waveformBufferRef = useRef<number[]>([]);
  const autoStopTriggeredRef = useRef(false);

  //マイク権限
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("マイク権限が必要です", "設定でマイクを許可してください。");
      }
    })();
  }, []);

  //位置情報権限
  useEffect(() => {
    (async () => {
      const status = await Location.requestForegroundPermissionsAsync();
      if (!status.granted) {
        Alert.alert("位置情報の権限が必要です", "設定で位置情報の許可をお願いします。");
      }
    })();
  }, []);

  //Draft作成
  const handleStop = useCallback(
    async (result: { audioUri: string; durationMs: number }) => {
      if (!createdAt || !dateKey) return;

      setDraft({
        dateKey,
        createdAt,
        audioUri: result.audioUri,
        durationMs: result.durationMs,
        location,
        memo: "",
        waveform: waveformBufferRef.current,
        waveformSampleIntervalMs: sampleIntervalMs,
        recording_title: "",
      });
      waveformBufferRef.current = [];
      resetRecording();

      router.push("/edit");
    },
    [createdAt, dateKey, location, router, sampleIntervalMs, setDraft, resetRecording],
  );

  //30秒タイマー、handleStop実行
  useEffect(() => {
    if (!recordingInProgress) {
      autoStopTriggeredRef.current = false;
      return;
    }
    if (autoStopTriggeredRef.current) return;
    if (currentDurationMs >= MAX_MS) {
      autoStopTriggeredRef.current = true;
      (async () => {
        const result = await stopRecording();
        if (result) {
          await handleStop(result);
        }
      })();
    }
  }, [recordingInProgress, currentDurationMs, MAX_MS, stopRecording, handleStop]);

  //録音スタート、ストップ
  const onPressRecord = async () => {
    if (recordingInProgress) {
      const result = await stopRecording();
      if (result) {
        await handleStop(result);
      }
    } else {
      await startRecording();
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, backgroundColor: "#B5B6B6" }}>
      <LevelLineDisplay recordingInProgress={recordingInProgress} latestDecibel={latestDecibel} />

      <View style={{ flex: 2 }}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-end" }}>
          <WaveformDisplay
            recordingInProgress={recordingInProgress}
            latestDecibel={latestDecibel}
            maxMs={MAX_MS}
            sampleIntervalMs={sampleIntervalMs}
            waveformBufferRef={waveformBufferRef}
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
        <RecordButton isRecording={recordingInProgress} onPress={onPressRecord} />
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
