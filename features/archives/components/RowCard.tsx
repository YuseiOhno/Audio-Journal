import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatCreatedAtLocal, formatSeconds } from "@/core/lib/format";
import { RecordingRow } from "@/core/types/types";
import { formatLocationText, getDateParts } from "@/features/archives/lib/archiveFormat";

type Props = {
  item: RecordingRow;
  onPress: (item: RecordingRow) => void;
};

export default function RowCard({ item, onPress }: Props) {
  const { year, monthDay } = getDateParts(item.date_key);

  return (
    <Pressable style={styles.rowCard} onPress={() => onPress(item)}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowYear}>{year}</Text>
        <Text style={styles.rowMonthDay}>{monthDay}</Text>
      </View>
      <View style={styles.rowRight}>
        <View style={styles.rowHeader}>
          <Text style={styles.rowTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.recording_title}
          </Text>
          <Text style={styles.rowDuration}>{formatSeconds(item.duration_ms)}</Text>
        </View>
        <Text style={styles.rowMeta}>{formatCreatedAtLocal(item.created_at)}</Text>
        <Text style={styles.rowMeta}>{formatLocationText(item.lat, item.lng, item.accuracy)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
    minWidth: 0,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    flex: 1,
    flexShrink: 1,
  },
  rowDuration: {
    fontSize: 13,
    color: "#555555",
    flexShrink: 0,
  },
  rowMeta: {
    fontSize: 13,
    color: "#444444",
  },
});
