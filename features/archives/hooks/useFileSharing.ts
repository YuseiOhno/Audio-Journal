import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

const mimeMap: Record<string, string> = {
  wav: "audio/wav",
  m4a: "audio/mp4",
  mp3: "audio/mpeg",
};
export const shareFile = async (fileUri: string) => {
  const ext = fileUri.split(".").pop()?.toLocaleLowerCase();
  const mime = ext ? mimeMap[ext] : undefined;

  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    Alert.alert("このデバイスでは共有機能を利用できません");
    return;
  }

  try {
    await Sharing.shareAsync(fileUri, {
      dialogTitle: "ファイルの共有",
      ...(mime ? { mimeType: mime } : {}),
    });
  } catch (e) {
    Alert.alert("共有中にエラーが発生しました", String((e as any)?.message ?? e));
  }
};
