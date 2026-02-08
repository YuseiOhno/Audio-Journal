import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Keyboard, StyleSheet, Text, TextInput, View } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { getRecordingRecordById, getRecordings } from "@/core/db/repositories/recordings";
import { RecordingRow } from "@/core/types/types";
import DetailSheet from "../components/DetailSheet";
import RowCard from "@/features/archives/components/RowCard";
import SearchBar from "@/features/archives/components/SearchBar";
import usePopupMenu from "../hooks/usePopupMenu";
import useSortMenu, { SortKey } from "../hooks/useSortMenu";

export default function ArchivesScreen() {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [rows, setRows] = useState<RecordingRow[]>([]);
  const [selected, setSelected] = useState<RecordingRow>();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const searchInputRef = useRef<TextInput>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { openId } = useLocalSearchParams<{ openId?: string }>();
  const router = useRouter();

  const { top } = useSafeAreaInsets();
  const searchBarHeight = 38;
  const searchBarMargin = 20;

  const showPopupMenu = usePopupMenu();
  const showSortMenu = useSortMenu();

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

  // サーチフィルター
  const filteredRows = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return rows;
    return rows.filter((row) => {
      return (
        String(row.id).includes(trimmed) ||
        row.date_key.toLowerCase().includes(trimmed) ||
        row.recording_title?.toLowerCase().includes(trimmed) ||
        row.memo?.toLowerCase().includes(trimmed)
      );
    });
  }, [query, rows]);

  //ソート処理
  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    switch (sortKey) {
      case "newest":
        return sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
      case "oldest":
        return sorted.sort((a, b) => a.created_at.localeCompare(b.created_at));
      case "titleAsc":
        return sorted.sort((a, b) => a.recording_title.localeCompare(b.recording_title));
      case "titleDesc":
        return sorted.sort((a, b) => b.recording_title.localeCompare(a.recording_title));
      default:
        return sorted;
    }
  }, [filteredRows, sortKey]);

  //ボトムシートの表示
  const onPressRow = useCallback(async (id: number) => {
    if (searchInputRef.current?.isFocused()) {
      searchInputRef.current.blur();
      Keyboard.dismiss();
    }
    const record = await getRecordingRecordById(id);
    setSelected(record);
    requestAnimationFrame(() => {
      bottomSheetRef.current?.snapToIndex(1);
    });
  }, []);

  //詳細画面からポップアップメニューを表示
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

  //ソートハンドラー
  const onPressSort = useCallback(() => {
    showSortMenu({
      current: sortKey,
      onSelect: setSortKey,
    });
  }, [showSortMenu, sortKey]);

  return (
    <View style={styles.container}>
      <SearchBar
        topInset={top}
        searchBarHeight={searchBarHeight}
        searchBarMargin={searchBarMargin}
        query={query}
        onQueryChange={setQuery}
        onPressSort={onPressSort}
        inputRef={searchInputRef}
        headerOpacity={headerOpacity}
      />

      <Animated.FlatList
        data={sortedRows}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: top + searchBarMargin + searchBarHeight + 16 },
        ]}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        renderItem={({ item }) => <RowCard item={item} onPress={(row) => onPressRow(row.id)} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>no record</Text>
          </View>
        }
      />

      <DetailSheet ref={bottomSheetRef} selected={selected} onOpenMenu={onOpenMenu} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B5B6B6",
    position: "relative",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: "#666666",
  },
});
