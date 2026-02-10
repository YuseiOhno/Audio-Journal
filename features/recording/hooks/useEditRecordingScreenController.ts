import { useCallback, useEffect, useState } from "react";
import { Alert, Keyboard, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useRecordingDraftStore } from "@/features/recording/store/recordingDraftStore";
import {
  getRecordingDraftById,
  insertRecording,
  updateRecordingTitleMemoById,
} from "@/core/db/repositories/recordings";
import { moveRecordingToDocuments, removeIfExists } from "@/core/lib/recordingFileService";

export default function useEditRecordingScreenController() {
  const draft = useRecordingDraftStore((s) => s.draft);
  const updateDraft = useRecordingDraftStore((s) => s.updateDraft);
  const clearDraft = useRecordingDraftStore((s) => s.clearDraft);
  const setDraft = useRecordingDraftStore((s) => s.setDraft);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id?: string }>();
  const editId = id ? Number(id) : null;
  const isEditing = Number.isFinite(editId);

  // キーボードの高さを取得
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

  // 既存レコードを読み込む(edit)
  useEffect(() => {
    if (!isEditing || editId == null) return;
    let active = true;

    (async () => {
      const record = await getRecordingDraftById(editId);
      if (!active) return;

      if (!record) {
        Alert.alert("録音が見つかりませんでした");
        router.back();
        return;
      }
      setDraft(record);
    })();
    return () => {
      active = false;
    };
  }, [isEditing, editId, router, setDraft]);

  // DBインサートorアップデート
  const onSave = useCallback(async () => {
    if (!draft) return;

    const patch: Partial<typeof draft> = {};
    if (draft.recording_title === "") patch.recording_title = "Untitled";
    if (draft.memo === "") patch.memo = "null";
    const finalDraft = { ...draft, ...patch };

    try {
      // アップデート
      if (isEditing && editId != null) {
        await updateRecordingTitleMemoById(editId, {
          recording_title: finalDraft.recording_title,
          memo: finalDraft.memo,
        });
        clearDraft();
        router.navigate({
          pathname: "/(tabs)/archives",
          params: { openId: String(editId) },
        });
        return;
      }

      // インサート
      if (finalDraft.audioUri) {
        const newUri = await moveRecordingToDocuments(finalDraft.audioUri);
        finalDraft.audioUri = newUri;
      }
      const newId = await insertRecording(finalDraft);
      clearDraft();
      router.navigate({
        pathname: "/(tabs)/archives",
        params: { openId: String(newId) },
      });
    } catch (e: any) {
      Alert.alert("保存に失敗しました", String(e?.message ?? e));
    }
  }, [draft, clearDraft, router, isEditing, editId]);

  // キャンセル
  const onCancel = useCallback(async () => {
    try {
      if (!isEditing && draft?.audioUri) {
        await removeIfExists(draft.audioUri);
      }
      clearDraft();
      if (isEditing) {
        router.navigate({
          pathname: "/(tabs)/archives",
          params: { openId: String(editId) },
        });
        return;
      }
      router.navigate("/(tabs)");
    } catch (e: any) {
      Alert.alert(String(e?.message ?? e));
    }
  }, [draft, clearDraft, router, editId, isEditing]);

  return {
    draft,
    updateDraft,
    keyboardHeight,
    onSave,
    onCancel,
  };
}
