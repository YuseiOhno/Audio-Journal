import { deleteRecordingRecordById } from "@/core/db/repositories/recordings";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { shareFile, removeIfExists } from "@/core/lib/recordingFileService";

type Props = {
  id?: number;
  audioUri?: string;
  refresh: () => Promise<void>;
  onBottomSheetClosed?: () => void;
};

export default function usePopupMenu() {
  const { showActionSheetWithOptions } = useActionSheet();
  const router = useRouter();

  return ({ id, audioUri, refresh, onBottomSheetClosed }: Props) => {
    const options = ["ファイルの共有", "編集", "削除", "キャンセル"];
    const destructiveButtonIndex = 2; //red

    //Delete確認
    const confirmDelete = (id?: number, audioUri?: string) => {
      Alert.alert("削除しますか？", "この録音は元に戻せません。", [
        { text: "キャンセル", style: "cancel" },
        { text: "削除", style: "destructive", onPress: () => handleDelete(id, audioUri) },
      ]);
    };

    //Delete処理
    const handleDelete = async (id?: number, audioUri?: string) => {
      if (id == null) return;
      try {
        if (audioUri) {
          await removeIfExists(audioUri);
        }
        const ok = await deleteRecordingRecordById(id);
        if (ok) {
          Alert.alert("削除しました");
          await refresh();
          onBottomSheetClosed?.();
          return;
        }
      } catch {
        Alert.alert("削除に失敗しました");
        await refresh();
      }
    };

    //ファイル共有
    const handleShareFile = async (audioUri?: string) => {
      if (!audioUri) return;
      const result = await shareFile(audioUri);
      if (!result.ok) {
        if (result.reason === "UNAVAILABLE") {
          Alert.alert("このデバイスでは共有機能を利用できません");
        } else {
          Alert.alert("共有中にエラーが発生しました", result.message ?? "不明なエラー");
        }
      }
    };

    showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex,
        tintColor: "#333333",
        userInterfaceStyle: "light",
      },
      (selectedIndex) => {
        switch (selectedIndex) {
          case 0:
            handleShareFile(audioUri); //share
            break;
          case 1:
            if (id != null) {
              onBottomSheetClosed?.();
              router.push({ pathname: "/edit", params: { id: String(id) } }); //edit
            }
            break;
          case destructiveButtonIndex:
            confirmDelete(id, audioUri); //delete
            break;
          case 3:
            //cancel
            break;
        }
      },
    );
  };
}
