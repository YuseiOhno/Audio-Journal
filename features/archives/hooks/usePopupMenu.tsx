import { deleteRecordingRecordById } from "@/core/db/repositories/recordings";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useRouter } from "expo-router";
import { File } from "expo-file-system";
import { Alert } from "react-native";

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
    const options = ["Edit", "Delete", "Cancel"];
    const destructiveButtonIndex = 1; //red

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
          const file = new File(audioUri);
          file.delete();
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
            if (id != null) {
              onBottomSheetClosed?.();
              router.push({ pathname: "/edit", params: { id: String(id) } }); //edit
            }
            break;
          case destructiveButtonIndex:
            confirmDelete(id, audioUri); //delete
            break;
          case 2:
            //cancel
            break;
        }
      },
    );
  };
}
