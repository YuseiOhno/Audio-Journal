import { Alert, Text, View, KeyboardAvoidingView } from "react-native";
import { AudioModule, setAudioModeAsync } from "expo-audio";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";

import { RecordButton } from "@/components/RecordButton";
import WaveformDisplay from "@/components/WaveformDisplay";
import LevelLineDisplay from "@/components/LevelLineDisplay";
import { MemoModal } from "@/components/MemoModal";

import useAudioRecorderHook from "@/hooks/useAudioRecorderHook";

import { insertRecording, readRecordings } from "@/db/repositories/recordings";

export default function Index() {
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

  //test
  useEffect(() => {
    (async () => {
      const rows = await readRecordings();
      console.log(rows);
    })();
  }, [audioUri]);

  //マイク権限
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("マイク権限が必要です", "設定でマイクを許可してください。");
      }
      if (status.granted) {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
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
    try {
      await insertRecording({
        dateKey,
        createdAt,
        audioUri,
        durationMs,
        lat: location?.lat ?? null,
        lng: location?.lng ?? null,
        accuracy: location?.accuracy ?? null,
        memo: memo.trim() || null,
        waveform: waveformBufferRef.current,
        waveformSampleIntervalMs: sampleIntervalMs,
        recording_title: recTitle,
      });
      setMemoVisible(false);
      resetRecording();
      waveformBufferRef.current = [];
      lastAudioUriRef.current = null;
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
          onChnageRecTitle={setRecTitle}
          onSave={handleSaveDB}
          onRetry={handleRetry}
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
          onStart={() => startRecording()}
          onStop={() => stopRecording()}
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
      >
        <Text style={{ fontSize: 12, color: "#666" }}>
          file:///Users/ohnoyusei/Library/Developer/CoreSimulator/Devices/FE0430B0-F577-4B95-ADC3-828BC0BC6E02/data/Containers/Data/Application/6A6AF0EF-5D14-4D91-BBD0-C4878C8E310F/Library/Caches/ExponentExperienceData/@yuseiohno/musann/ExpoAudio/recording-5DEDA14F-6144-4A24-9AC3-A2BAE123407B.m4a
        </Text>
      </View>
    </View>
  );
}
