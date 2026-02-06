import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";

import { useRecordingDraftStore } from "../store/recordingDraftStore";
import { insertRecording } from "@/core/db/repositories/recordings";
import { useNavigation, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { moveRecordingToDocuments } from "../lib/moveRecordingToDocuments";
import { File } from "expo-file-system";

export default function EditRecordingScreen() {
  const draft = useRecordingDraftStore((s) => s.draft);
  const updateDraft = useRecordingDraftStore((s) => s.updateDraft);
  const clearDraft = useRecordingDraftStore((s) => s.clearDraft);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const router = useRouter();
  const navigation = useNavigation();

  console.log(draft);

  //キーボードの高さを取得
  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      },
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0),
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  //DBインサート
  const onSave = useCallback(async () => {
    if (!draft) return;

    const patch: Partial<typeof draft> = {};
    if (draft.recording_title === "") patch.recording_title = "Untitled";
    if (draft.memo === "") patch.memo = "N/A";
    if (draft.audioUri) {
      const newUri = await moveRecordingToDocuments(draft.audioUri);
      patch.audioUri = newUri;
    }
    const finalDraft = { ...draft, ...patch };

    try {
      await insertRecording(finalDraft);
      clearDraft();
      router.navigate("/(tabs)/archives");
    } catch (e: any) {
      Alert.alert("保存に失敗しました", String(e?.message ?? e));
    }
  }, [draft, clearDraft, router]);

  //キャンセル
  const onCancel = useCallback(async () => {
    try {
      if (draft?.audioUri) {
        const file = new File(draft.audioUri);
        file.delete();
      }
      clearDraft();
      router.navigate("/(tabs)");
    } catch (e: any) {
      Alert.alert("削除に失敗しました", String(e?.message ?? e));
    }
  }, [draft, clearDraft, router]);

  //ヘッダーボタン
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={onSave} style={styles.headerRight}>
          <Ionicons name="save-outline" size={22} color="#333333" />
        </TouchableOpacity>
      ),
      headerLeft: () => (
        <TouchableOpacity onPress={onCancel} style={styles.headerLeft}>
          <Ionicons name="chevron-back-outline" size={22} color="#333333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, onSave, onCancel]);

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { paddingBottom: keyboardHeight }]}>
        <TextInput
          value={draft?.recording_title ?? ""}
          onChangeText={(text) => updateDraft({ recording_title: text })}
          autoFocus
          placeholder="タイトル"
          placeholderTextColor="#888888"
          maxLength={20}
          style={styles.titleInput}
          returnKeyType="next"
        />
        <TextInput
          value={draft?.memo ?? ""}
          onChangeText={(text) => updateDraft({ memo: text })}
          multiline
          scrollEnabled
          placeholder="メモ"
          placeholderTextColor="#888888"
          maxLength={150}
          style={styles.memoInput}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: "rgb(239, 239, 239)",
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
  },
  titleInput: {
    fontSize: 16,
    backgroundColor: "rgb(239, 239, 239)",
    padding: 16,
    margin: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(160, 157, 157, 0.2)",
  },
  memoInput: {
    flex: 1,
    fontSize: 16,
    backgroundColor: "rgb(239, 239, 239)",
    padding: 16,
    margin: 10,
  },
  headerRight: {
    backgroundColor: "rgba(230, 230, 230, 0.3)",
    height: 36,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    // marginRight: 16,
    marginBottom: 6,
  },
  headerLeft: {
    backgroundColor: "rgba(230, 230, 230, 0.3)",
    height: 36,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    // marginLeft: 16,
    marginBottom: 6,
  },
});
