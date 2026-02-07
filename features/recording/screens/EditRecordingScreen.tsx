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
import {
  getRecordingRecordById,
  insertRecording,
  updateRecordingTitleMemoById,
} from "@/core/db/repositories/recordings";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { moveRecordingToDocuments } from "../lib/moveRecordingToDocuments";
import { File } from "expo-file-system";

export default function EditRecordingScreen() {
  const draft = useRecordingDraftStore((s) => s.draft);
  const updateDraft = useRecordingDraftStore((s) => s.updateDraft);
  const clearDraft = useRecordingDraftStore((s) => s.clearDraft);
  const setDraft = useRecordingDraftStore((s) => s.setDraft);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const router = useRouter();
  const navigation = useNavigation();

  const { id } = useLocalSearchParams<{ id?: string }>();
  const editId = id ? Number(id) : null;
  const isEditing = Number.isFinite(editId);

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

  //既存レコードを読み込む(edit)
  useEffect(() => {
    if (!isEditing || editId == null) return;
    let active = true;
    (async () => {
      const record = await getRecordingRecordById(editId);
      if (!active) return;
      if (!record) {
        Alert.alert("録音が見つかりませんでした");
        router.back();
        return;
      }
      setDraft({
        dateKey: record.date_key,
        createdAt: record.created_at,
        audioUri: record.audio_uri,
        durationMs: record.duration_ms,
        location:
          record.lat == null || record.lng == null
            ? null
            : { lat: record.lat, lng: record.lng, accuracy: record.accuracy ?? null },
        memo: record.memo ?? "",
        waveform: record.waveform_blob ?? [],
        waveformSampleIntervalMs: record.waveform_sample_interval_ms,
        recording_title: record.recording_title ?? "",
      });
    })();
    return () => {
      active = false;
    };
  }, [isEditing, editId, router, setDraft]);

  //DBインサート、アップデート
  const onSave = useCallback(async () => {
    if (!draft) return;

    const patch: Partial<typeof draft> = {};
    if (draft.recording_title === "") patch.recording_title = "Untitled";
    if (draft.memo === "") patch.memo = "N/A";
    const finalDraft = { ...draft, ...patch };

    try {
      //アップデート
      if (isEditing && editId != null) {
        await updateRecordingTitleMemoById(editId, {
          recording_title: finalDraft.recording_title,
          memo: finalDraft.memo,
        });
        clearDraft();
        router.navigate("/(tabs)/archives");
        return;
      }

      //インサート
      if (finalDraft.audioUri) {
        const newUri = await moveRecordingToDocuments(finalDraft.audioUri);
        finalDraft.audioUri = newUri;
      }
      await insertRecording(finalDraft);
      clearDraft();
      router.navigate("/(tabs)/archives");
    } catch (e: any) {
      Alert.alert("保存に失敗しました", String(e?.message ?? e));
    }
  }, [draft, clearDraft, router, isEditing, editId]);

  //キャンセル
  const onCancel = useCallback(async () => {
    try {
      if (!isEditing && draft?.audioUri) {
        const file = new File(draft.audioUri);
        file.delete();
      }
      clearDraft();
      if (isEditing) {
        router.back();
        return;
      }
      router.navigate("/(tabs)");
    } catch (e: any) {
      Alert.alert("削除に失敗しました", String(e?.message ?? e));
    }
  }, [draft, clearDraft, router, isEditing]);

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
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  headerLeft: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
});
