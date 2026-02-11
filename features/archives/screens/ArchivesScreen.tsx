import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DetailSheet from "../components/DetailSheet";
import RowCard from "@/features/archives/components/RowCard";
import SearchBar from "@/features/archives/components/SearchBar";
import useArchivesScreenController from "@/features/archives/hooks/useArchivesScreenController";

export default function ArchivesScreen() {
  const { top } = useSafeAreaInsets();
  const searchBarHeight = 38;
  const searchBarMargin = 20;
  const {
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
  } = useArchivesScreenController();

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
