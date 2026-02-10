import { useCallback, useEffect, useState } from "react";
import { AudioModule } from "expo-audio";
import * as Location from "expo-location";
import { Alert } from "react-native";

type PermissionStatus = "idle" | "checking" | "granted" | "denied";

export default function useRecordingPermissions() {
  const [mic, setMic] = useState<PermissionStatus>("idle");
  const [location, setLocation] = useState<PermissionStatus>("idle");

  const requestAll = useCallback(async () => {
    setMic("checking");
    setLocation("checking");

    try {
      const micStatus = await AudioModule.requestRecordingPermissionsAsync();
      if (micStatus.granted) {
        setMic("granted");
      } else {
        setMic("denied");
        Alert.alert("マイク権限が必要です", "設定でマイクを許可してください。");
      }

      const locationStatus = await Location.requestForegroundPermissionsAsync();
      if (locationStatus.granted) {
        setLocation("granted");
      } else {
        setLocation("denied");
        Alert.alert("位置情報の権限が必要です", "設定で位置情報の許可をお願いします。");
      }
    } catch {
      setMic((prev) => (prev === "granted" ? prev : "denied"));
      setLocation((prev) => (prev === "granted" ? prev : "denied"));
      Alert.alert("権限確認に失敗しました", "権限状態を確認できませんでした。");
    }
  }, []);

  useEffect(() => {
    requestAll();
  }, [requestAll]);

  const ready = mic === "granted" && location === "granted";

  return {
    mic,
    ready,
  };
}
