import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Keyboard, TextInput } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { getRecordingRecordById, getRecordings } from "@/core/db/repositories/recordings";
import type { RecordingListItem, RecordingRow } from "@/core/types/types";
import type { SortKey } from "@/features/archives/lib/sort";
import useFilteredAndSortedRecordings from "@/features/archives/hooks/useFilteredAndSortedRecordings";
import usePopupMenu from "@/features/archives/hooks/usePopupMenu";
import useSortMenu from "@/features/archives/hooks/useSortMenu";

export default function useArchivesScreenController() {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [rows, setRows] = useState<RecordingListItem[]>([]);
  const [selected, setSelected] = useState<RecordingRow>();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const searchInputRef = useRef<TextInput>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { openId } = useLocalSearchParams<{ openId?: string }>();
  const router = useRouter();

  const showPopupMenu = usePopupMenu();
  const showSortMenu = useSortMenu();
  const { sortedRows } = useFilteredAndSortedRecordings({ rows, query, sortKey });

  // フォーカスのたびリフレッシュ
  const loadRecordings = useCallback(async () => {
    const result = await getRecordings();
    setRows(result ?? []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecordings();
    }, [loadRecordings]),
  );

  // アクション後、対象のボトムシートを開く
  useEffect(() => {
    if (!openId) return;
    let active = true;
    (async () => {
      await loadRecordings();
      const record = await getRecordingRecordById(Number(openId));
      if (!active) return;
      if (record) {
        setSelected(record);
        requestAnimationFrame(() => {
          bottomSheetRef.current?.snapToIndex(1);
        });
      }
      router.setParams({ openId: undefined });
    })();
    return () => {
      active = false;
    };
  }, [openId, loadRecordings, router]);

  // ボトムシートの表示
  const onPressRow = useCallback(async (id: number) => {
    if (searchInputRef.current?.isFocused()) {
      searchInputRef.current.blur();
      Keyboard.dismiss();
    }
    const record = await getRecordingRecordById(id);
    setSelected(record ?? undefined);
    requestAnimationFrame(() => {
      bottomSheetRef.current?.snapToIndex(1);
    });
  }, []);

  // ボトムシートからポップアップメニューを表示
  const onOpenMenu = useCallback(
    (closeSheet: () => void) => {
      showPopupMenu({
        id: selected?.id,
        audioUri: selected?.audio_uri,
        refresh: () => loadRecordings(),
        onBottomSheetClosed: closeSheet,
      });
    },
    [selected, showPopupMenu, loadRecordings],
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // ソートハンドラー
  const onPressSort = useCallback(() => {
    showSortMenu({
      current: sortKey,
      onSelect: setSortKey,
    });
  }, [showSortMenu, sortKey]);

  return {
    query,
    setQuery,
    sortedRows,
    selected,
    bottomSheetRef,
    searchInputRef,
    scrollY,
    headerOpacity,
    onPressRow,
    onOpenMenu,
    onPressSort,
  };
}
