import { useLayoutEffect } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import useEditRecordingScreenController from "@/features/recording/hooks/useEditRecordingScreenController";

export default function EditRecordingScreen() {
  const { draft, updateDraft, keyboardHeight, onSave, onCancel } =
    useEditRecordingScreenController();
  const navigation = useNavigation();

  // ヘッダーボタン
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
