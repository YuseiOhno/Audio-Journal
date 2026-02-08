import { useActionSheet } from "@expo/react-native-action-sheet";

export type SortKey = "newest" | "oldest" | "titleAsc" | "titleDesc";

type OpenSortMenuParams = {
  current: SortKey;
  onSelect: (next: SortKey) => void;
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "新しい順" },
  { key: "oldest", label: "古い順" },
  { key: "titleAsc", label: "タイトル 昇順" },
  { key: "titleDesc", label: "タイトル 降順" },
];

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
      {
        options,
        cancelButtonIndex,
        tintColor: "#333333",
        userInterfaceStyle: "light",
      },
      (pressedIndex) => {
        if (pressedIndex == null || pressedIndex === cancelButtonIndex) return;
        const next = SORT_OPTIONS[pressedIndex];
        if (!next || next.key === current) return;
        onSelect(next.key);
      },
    );
  };
}
