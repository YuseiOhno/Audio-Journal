import { useRef, useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Keyboard, Platform } from "react-native";

import { useRecordingDraftStore } from "../store/recordingDraftStore";

export default function EditRecordingScreen() {
  const draft = useRecordingDraftStore((s) => s.draft);
  const updateDraft = useRecordingDraftStore((s) => s.updateDraft);
  const clearDraft = useRecordingDraftStore((s) => s.clearDraft);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const memoInputRef = useRef<TextInput>(null);

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

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { paddingBottom: keyboardHeight }]}>
        <TextInput
          autoFocus
          placeholder="タイトル"
          placeholderTextColor="#888888"
          maxLength={20}
          style={styles.titleInput}
          returnKeyType="next"
          onSubmitEditing={() => memoInputRef.current?.focus()}
        />
        <TextInput
          multiline
          scrollEnabled
          placeholder="メモ"
          placeholderTextColor="#888888"
          maxLength={150}
          style={styles.memoInput}
          ref={memoInputRef}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B5B6B6",
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
});
