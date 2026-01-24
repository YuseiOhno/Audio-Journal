import React from "react";
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  memo: string;
  onChangeMemo: (text: string) => void;
  onSave: () => void;
  onRetry: () => void;
};

export function MemoModal({ visible, memo, onChangeMemo, onSave, onRetry }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>メモを入力</Text>
          <TextInput
            value={memo}
            onChangeText={onChangeMemo}
            placeholder="メモ"
            placeholderTextColor="#888888"
            style={styles.input}
            multiline
          />
          <View style={styles.actions}>
            <Pressable onPress={onRetry} style={[styles.button, styles.secondary]}>
              <Text style={styles.secondaryText}>録り直す</Text>
            </Pressable>
            <Pressable onPress={onSave} style={[styles.button, styles.primary]}>
              <Text style={styles.primaryText}>保存</Text>
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
  input: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 12,
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
