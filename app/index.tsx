import { Alert, Text, View, KeyboardAvoidingView } from "react-native";
import { AudioModule, setAudioModeAsync } from "expo-audio";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { RecordButton } from "@/components/RecordButton";
import WaveformDisplay from "@/components/WaveformDisplay";
import LevelLineDisplay from "@/components/LevelLineDisplay";
import useAudioRecorderHook from "@/hooks/useAudioRecorderHook";
import { MemoModal } from "@/components/MemoModal";
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
  } = useAudioRecorderHook();
  const [memo, setMemo] = useState("");
  const [memoVisible, setMemoVisible] = useState(false);
  const lastAudioUriRef = useRef<string | null>(null);

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
      });
      setMemoVisible(false);
      setMemo("");
      resetRecording();
      lastAudioUriRef.current = null;
    } catch (e: any) {
      Alert.alert("保存に失敗しました", String(e?.message ?? e));
    }
  };

  //モーダル：キャンセル
  const handleRetry = () => {
    setMemoVisible(false);
    resetRecording();
    lastAudioUriRef.current = null;
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, backgroundColor: "#B5B6B6" }}>
      <KeyboardAvoidingView behavior={"padding"}>
        <MemoModal
          visible={memoVisible}
          memo={memo}
          onChangeMemo={setMemo}
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
      {/* <Button title="再生" onPress={play} disabled={!audioUri || recordingInProgress} /> */}
      {/* <Button title="リセット" onPress={() => setAudioUri(null)} /> */}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "flex-end",
          paddingBottom: 16,
        }}
      >
        {audioUri ? <Text style={{ fontSize: 12, color: "#666" }}>URI: {audioUri}</Text> : null}
      </View>
    </View>
  );
}
