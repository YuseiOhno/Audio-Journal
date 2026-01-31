import { useEffect, useMemo, useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Text, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { readRecordings } from "@/db/repositories/recordings";
import { splitDateKey } from "@/utils/dateKey";

type RecordingRow = {
  id: number;
  date_key: string;
  created_at: string;
  duration_ms: number | null;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
};

export default function Archives() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<RecordingRow[]>([]);
  const { top } = useSafeAreaInsets();

  const searchBarHeight = 38;
  const searchBarMargin = 20;

  useEffect(() => {
    (async () => {
      const result = await readRecordings();
      setRows(result);
    })();
  }, []);

  const filteredRows = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return rows;
    return rows.filter((row) => {
      return (
        String(row.id).includes(trimmed) ||
        row.date_key.toLowerCase().includes(trimmed) ||
        row.created_at.toLowerCase().includes(trimmed)
      );
    });
  }, [query, rows]);

  const getDateParts = (dateKey: string) => {
    const parts = splitDateKey(dateKey);
    if (!parts) return { year: "----", monthDay: "----" };
    const month = String(parts.month).padStart(2, "0");
    const day = String(parts.day).padStart(2, "0");
    return { year: String(parts.year), monthDay: `${month}${day}` };
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchBarWrap, { paddingTop: top + searchBarMargin }]}>
        <View style={[styles.searchBar, { height: searchBarHeight }]}>
          <Ionicons name="search-outline" size={18} color="#666666" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor="#9A9A9A"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity
          style={[styles.sortButton, { height: searchBarHeight, width: searchBarHeight }]}
        >
          <Ionicons name="funnel-outline" size={18} color="#666666" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRows}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: top + searchBarMargin + searchBarHeight + 16 },
        ]}
        renderItem={({ item }) => {
          const { year, monthDay } = getDateParts(item.date_key);
          return (
            <View style={styles.rowCard}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowYear}>{year}</Text>
                <Text style={styles.rowMonthDay}>{monthDay}</Text>
              </View>
              <View style={styles.rowRight}>
                <View style={styles.rowHeader}>
                  <Text style={styles.rowTitle}>#{item.id}</Text>
                  <Text style={styles.rowDate}>{item.date_key}</Text>
                </View>
                <Text style={styles.rowMeta}>created_at: {item.created_at}</Text>
                <Text style={styles.rowMeta}>duration_ms: {item.duration_ms ?? "null"}</Text>
                <Text style={styles.rowMeta}>
                  {item.lat == null || item.lng == null
                    ? "null"
                    : `${item.lat}, ${item.lng} (±${item.accuracy ?? "?"} m)`}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>記録がありません</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B5B6B6",
  },
  searchBarWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: 16,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchBar: {
    flex: 1,
    backgroundColor: "rgba(230, 230, 230, 0.3)",
    borderRadius: 20,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
  },
  sortButton: {
    backgroundColor: "rgba(230, 230, 230, 0.3)",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  rowCard: {
    backgroundColor: "rgba(230, 230, 230, 0.3)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  rowLeft: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  rowYear: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
  },
  rowMonthDay: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    letterSpacing: 1,
  },
  rowRight: {
    flex: 1,
    gap: 6,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },
  rowDate: {
    fontSize: 13,
    color: "#555555",
  },
  rowMeta: {
    fontSize: 13,
    color: "#444444",
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
