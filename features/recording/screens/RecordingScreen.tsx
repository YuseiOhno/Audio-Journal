import { Alert, Text, View, KeyboardAvoidingView } from "react-native";
import { AudioModule } from "expo-audio";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { RecordButton } from "@/features/recording/components/RecordButton";
import WaveformDisplay from "@/features/recording/components/WaveformDisplay";
import LevelLineDisplay from "@/features/recording/components/LevelLineDisplay";
import { MemoModal } from "@/features/recording/components/MemoModal";

import useAudioRecorderHook from "@/features/recording/hooks/useAudioRecorder";

import { insertRecording } from "@/core/db/repositories/recordings";

export default function RecordingScreen() {
  const {
    audioUri,
    recordingInProgress,
    startRecording,
    stopRecording,
    remainingSecondsText,
    latestDecibel,
    createdAt,
    dateKey,
    durationMs,
    location,
    resetRecording,
    MAX_MS,
    sampleIntervalMs,
  } = useAudioRecorderHook();

  const [memo, setMemo] = useState("");
  const [recTitle, setRecTitle] = useState("");
  const [memoVisible, setMemoVisible] = useState(false);
  const lastAudioUriRef = useRef<string | null>(null);
  const waveformBufferRef = useRef<number[]>([]);
  const router = useRouter();

  //test
  // useEffect(() => {
  //   (async () => {
  //     const rows = await getTest();
  //     console.log(rows);
  //   })();
  // }, [audioUri]);

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

  //audioUriが更新されるとモーダル表示
  useEffect(() => {
    if (audioUri && audioUri !== lastAudioUriRef.current) {
      setMemo("");
      setRecTitle("");
      setMemoVisible(true);
      lastAudioUriRef.current = audioUri;
    }
  }, [audioUri]);

  //モーダル：保存
  const handleSaveDB = async () => {
    if (!audioUri || !createdAt || !dateKey) return;
    const memoValue = memo.trim() === "" ? "N/A" : memo;
    const titleValue = recTitle.trim() === "" ? "Untitled" : recTitle;
    try {
      await insertRecording({
        dateKey,
        createdAt,
        audioUri,
        durationMs,
        lat: location?.lat ?? null,
        lng: location?.lng ?? null,
        accuracy: location?.accuracy ?? null,
        memo: memoValue,
        waveform: waveformBufferRef.current,
        waveformSampleIntervalMs: sampleIntervalMs,
        recording_title: titleValue,
      });
      setMemoVisible(false);
      resetRecording();
      waveformBufferRef.current = [];
      lastAudioUriRef.current = null;
      router.navigate("/(tabs)/archives");
    } catch (e: any) {
      Alert.alert("保存に失敗しました", String(e?.message ?? e));
    }
  };

  //モーダル：キャンセル
  const handleRetry = () => {
    setMemoVisible(false);
    resetRecording();
    waveformBufferRef.current = [];
    lastAudioUriRef.current = null;
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, backgroundColor: "#B5B6B6" }}>
      <KeyboardAvoidingView behavior={"padding"}>
        <MemoModal
          visible={memoVisible}
          memo={memo}
          onChangeMemo={setMemo}
          recTitle={recTitle}
          onChangeRecTitle={setRecTitle}
          onSave={handleSaveDB}
          onCancel={handleRetry}
        />
      </KeyboardAvoidingView>

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
        <RecordButton
          isRecording={recordingInProgress}
          onPress={() => (recordingInProgress ? stopRecording() : startRecording())}
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
