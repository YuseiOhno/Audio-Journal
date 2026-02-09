// features/archives/hooks/useFilteredAndSortedRecordings.ts
import { useMemo } from "react";
import type { RecordingRow } from "@/core/types/types";
import { SORT_OPTIONS, type SortKey } from "./useSortMenu";

type Params = {
  rows: RecordingRow[];
  query: string;
  sortKey: SortKey;
};

export default function useFilteredAndSortedRecordings({ rows, query, sortKey }: Params) {
  const filteredRows = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return rows;

    return rows.filter((row) => {
      return (
        String(row.id).includes(trimmed) ||
        row.date_key.toLowerCase().includes(trimmed) ||
        (row.recording_title ?? "").toLowerCase().includes(trimmed) ||
        (row.memo ?? "").toLowerCase().includes(trimmed)
      );
    });
  }, [rows, query]);

  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    const selected = SORT_OPTIONS.find((option) => option.key === sortKey);
    return selected ? sorted.sort(selected.compare) : sorted;
  }, [filteredRows, sortKey]);

  return { sortedRows };
}
