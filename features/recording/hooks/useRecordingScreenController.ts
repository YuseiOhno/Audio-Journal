import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "expo-router";

import useLiveWaveform from "@/features/recording/hooks/useLiveWaveform";
import useRecordingPermissions from "@/features/recording/hooks/useRecordingPermissions";
import useAudioRecorderHook from "@/features/recording/hooks/useAudioRecorder";
import { useRecordingDraftStore } from "@/features/recording/store/recordingDraftStore";

export default function useRecordingScreenController() {
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

  // Draft作成
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

  // 30秒タイマー、handleStop実行
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

  // 録音スタート、ストップ
  const onPressRecord = useCallback(async () => {
    if (!ready) return;
    if (recordingInProgress) {
      const result = await stopRecording();
      if (result) {
        await handleStop(result);
      }
      return;
    }
    await startRecording();
  }, [ready, recordingInProgress, stopRecording, handleStop, startRecording]);

  return {
    recordingInProgress,
    remainingSecondsText,
    latestDecibel,
    targetBars,
    waveformValues,
    onPressRecord,
    disabled: mic === "denied",
  };
}
