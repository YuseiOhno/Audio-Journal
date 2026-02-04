import React from "react";
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  memo: string;
  onChangeMemo: (text: string) => void;
  recTitle: string;
  onChangeRecTitle: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function MemoModal({
  visible,
  memo,
  onChangeMemo,
  recTitle,
  onChangeRecTitle,
  onSave,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Recording Description</Text>
          <TextInput
            value={recTitle}
            onChangeText={onChangeRecTitle}
            placeholder="Title"
            placeholderTextColor="#888888"
            style={styles.recTitleInput}
            maxLength={20}
          />
          <TextInput
            value={memo}
            onChangeText={onChangeMemo}
            placeholder="Memo"
            placeholderTextColor="#888888"
            style={styles.memoInput}
            multiline
            maxLength={150}
          />
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={[styles.button, styles.secondary]}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onSave} style={[styles.button, styles.primary]}>
              <Text style={styles.primaryText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#F7F7F7",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  recTitleInput: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
    color: "#333333",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  memoInput: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#333333",
    backgroundColor: "#FFFFFF",
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primary: {
    backgroundColor: "#333333",
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  secondary: {
    backgroundColor: "#E6E6E6",
  },
  secondaryText: {
    color: "#333333",
    fontWeight: "600",
  },
});
