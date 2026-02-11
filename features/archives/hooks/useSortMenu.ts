// features/archives/hooks/useSortMenu.ts
import { useActionSheet } from "@expo/react-native-action-sheet";
import { SORT_OPTIONS, OpenSortMenuParams } from "../lib/sort";

export default function useSortMenu() {
  const { showActionSheetWithOptions } = useActionSheet();

  return ({ current, onSelect }: OpenSortMenuParams) => {
    const options = [
      ...SORT_OPTIONS.map((option) =>
        option.key === current ? `✓ ${option.label}` : option.label,
      ),
      "キャンセル",
    ];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      { options, cancelButtonIndex, tintColor: "#333333", userInterfaceStyle: "light" },
      (pressedIndex) => {
        if (pressedIndex == null || pressedIndex === cancelButtonIndex) return;
        const next = SORT_OPTIONS[pressedIndex];
        if (!next || next.key === current) return;
        onSelect(next.key);
      },
    );
  };
}
