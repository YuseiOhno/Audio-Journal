import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import WaveformBars from "@/features/UI/WaveformBars";
import useLiveWaveform from "@/features/recording/hooks/useLiveWaveform";
import useRecordingPermissions from "@/features/recording/hooks/useRecordingPermissions";

import { RecordButton } from "@/features/recording/components/RecordButton";
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
  const { mic, ready } = useRecordingPermissions();

  const router = useRouter();
  const setDraft = useRecordingDraftStore((state) => state.setDraft);
  const waveformBufferRef = useRef<number[]>([]);
  const autoStopTriggeredRef = useRef(false);
  const targetBars = Math.ceil(MAX_MS / sampleIntervalMs);
  const waveformValues = useLiveWaveform({
    recordingInProgress,
    latestDecibel,
    targetBars,
    sampleIntervalMs,
    waveformBufferRef,
  });

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
        recording_title: "",
      });
      waveformBufferRef.current = [];
      resetRecording();

      router.push("/edit");
    },
    [createdAt, dateKey, location, router, setDraft, resetRecording],
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
    if (!ready) return;
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
          disabled={mic === "denied"}
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
