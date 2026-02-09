// features/archives/hooks/useSortMenu.ts
import { useActionSheet } from "@expo/react-native-action-sheet";
import type { RecordingRow } from "@/core/types/types";

type SortOption = {
  key: "newest" | "oldest" | "titleAsc" | "titleDesc";
  label: string;
  compare: (a: RecordingRow, b: RecordingRow) => number;
};

export const SORT_OPTIONS = [
  {
    key: "newest",
    label: "新しい順",
    compare: (a, b) => b.created_at.localeCompare(a.created_at),
  },
  {
    key: "oldest",
    label: "古い順",
    compare: (a, b) => a.created_at.localeCompare(b.created_at),
  },
  {
    key: "titleAsc",
    label: "タイトル 昇順",
    compare: (a, b) => (a.recording_title ?? "").localeCompare(b.recording_title ?? ""),
  },
  {
    key: "titleDesc",
    label: "タイトル 降順",
    compare: (a, b) => (b.recording_title ?? "").localeCompare(a.recording_title ?? ""),
  },
] as const satisfies readonly SortOption[];

export type SortKey = (typeof SORT_OPTIONS)[number]["key"];

type OpenSortMenuParams = {
  current: SortKey;
  onSelect: (next: SortKey) => void;
};

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
