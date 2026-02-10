import type { RecordingListItem } from "@/core/types/types";

type SortOption = {
  key: "newest" | "oldest" | "titleAsc" | "titleDesc";
  label: string;
  compare: (a: RecordingListItem, b: RecordingListItem) => number;
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
    compare: (a, b) => a.recording_title.localeCompare(b.recording_title),
  },
  {
    key: "titleDesc",
    label: "タイトル 降順",
    compare: (a, b) => b.recording_title.localeCompare(a.recording_title),
  },
] as const satisfies readonly SortOption[];

export type SortKey = (typeof SORT_OPTIONS)[number]["key"];

export type OpenSortMenuParams = {
  current: SortKey;
  onSelect: (next: SortKey) => void;
};
