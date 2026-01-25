import { Alert, Text, View } from "react-native";
import { AudioModule, setAudioModeAsync } from "expo-audio";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { RecordButton } from "@/components/RecordButton";
import WaveformDisplay from "@/components/WaveformDisplay";
import LevelLineDisplay from "@/components/LevelLineDisplay";
import useAudioRecorderHook from "@/hooks/useAudioRecorderHook";
import { MemoModal } from "@/components/MemoModal";

export default function Index() {
  const {
    audioUri,
    recordingInProgress,
    startRecording,
    stopRecording,
    remainingSecondsText,
    latestDecibel,
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
  const handleSaveMemo = () => {
    setMemoVisible(false);
    resetRecording();
    lastAudioUriRef.current = null;
  };

  //モーダル：キャンセル
  const handleRetry = () => {
    setMemoVisible(false);
    resetRecording();
    lastAudioUriRef.current = null;
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, backgroundColor: "#B5B6B6" }}>
      <MemoModal
        visible={memoVisible}
        memo={memo}
        onChangeMemo={setMemo}
        onSave={handleSaveMemo}
        onRetry={handleRetry}
      />
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
