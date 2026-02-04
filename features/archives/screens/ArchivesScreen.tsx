import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Pressable,
  useWindowDimensions,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BlurView } from "expo-blur";

import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetFooter,
} from "@gorhom/bottom-sheet";

import { getRecordingRecordById, getRecordings } from "@/core/db/repositories/recordings";
import StaticWaveform from "@/features/archives/components/StaticWaveform";
import AudioPlayer from "@/features/archives/components/AudioPlayer";
import { splitDateKey, formatSeconds, formatCreatedAtLocal } from "@/core/lib/format";
import PopupMenu from "@/features/archives/components/PopupMenu";

type RecordingRow = {
  id: number;
  date_key: string;
  created_at: string;
  audio_uri: string;
  duration_ms: number;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  memo: string | null;
  waveform_blob: number[] | null;
  waveform_length: number;
  waveform_sample_interval_ms: number;
  recording_title: string | null;
};

export default function ArchivesScreen() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<RecordingRow[]>([]);
  const [selected, setSelected] = useState<RecordingRow>();
  const [contentHeight, setContentHeight] = useState(1);
  const [waveformBottom, setWaveformBottom] = useState<number | null>(null);
  const [footerHeight, setFooterHeight] = useState(0);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const searchInputRef = useRef<TextInput>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { top } = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const snapPoints = useMemo(() => {
    const maxSnap = Math.max(1, Math.floor(windowHeight * 0.9));
    const waveformSnap = waveformBottom == null ? contentHeight : waveformBottom + footerHeight;
    const clampedWaveformSnap = Math.max(1, Math.min(waveformSnap, maxSnap));
    return [clampedWaveformSnap, "90%"];
  }, [contentHeight, footerHeight, waveformBottom, windowHeight]);
  const searchBarHeight = 38;
  const searchBarMargin = 20;

  //フォーカスのたびリフレッシュ
  const loadRecordings = useCallback(async () => {
    const result = await getRecordings();
    setRows(result);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecordings();
    }, [loadRecordings]),
  );

  //サーチフィルター
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

  const getDateParts = (dateKey: string) => {
    const parts = splitDateKey(dateKey);
    if (!parts) return { year: "----", monthDay: "----" };
    const month = String(parts.month).padStart(2, "0");
    const day = String(parts.day).padStart(2, "0");
    return { year: String(parts.year), monthDay: `${month}${day}` };
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const AnimatedBlurView = useMemo(() => Animated.createAnimatedComponent(BlurView), []);

  return (
    <View style={styles.container}>
      <View style={[styles.searchBarWrap, { paddingTop: top + searchBarMargin }]}>
        <AnimatedBlurView
          intensity={20}
          tint="light"
          style={[StyleSheet.absoluteFillObject, { opacity: headerOpacity }]}
          pointerEvents="none"
        />
        <View style={[styles.searchBar, { height: searchBarHeight }]}>
          <Ionicons name="search-outline" size={18} color="#666666" />
          <TextInput
            ref={searchInputRef}
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

      <Animated.FlatList
        data={filteredRows}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: top + searchBarMargin + searchBarHeight + 16 },
        ]}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const { year, monthDay } = getDateParts(item.date_key);
          return (
            <Pressable
              style={styles.rowCard}
              onPress={async () => {
                if (searchInputRef.current?.isFocused()) {
                  searchInputRef.current.blur();
                  Keyboard.dismiss();
                }
                const record = await getRecordingRecordById(item.id);
                setSelected(record);
                requestAnimationFrame(() => {
                  bottomSheetRef.current?.snapToIndex(1);
                });
              }}
            >
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
                <Text style={styles.rowMeta}>
                  {item.lat == null || item.lng == null
                    ? "null"
                    : `${item.lat.toFixed(6)}, ${item.lng.toFixed(6)} (±${item.accuracy === null ? "?" : Math.floor(item.accuracy)} m)`}
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>no record</Text>
          </View>
        }
      />
      <GestureHandlerRootView style={styles.bottomSheetContainer} pointerEvents="box-none">
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          backgroundStyle={styles.bottomSheetBackground}
          backdropComponent={(props) => (
            <BottomSheetBackdrop {...props} pressBehavior="close" opacity={0.3} />
          )}
          footerComponent={(props) => (
            <BottomSheetFooter {...props}>
              <View
                onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
                style={{
                  paddingHorizontal: 36,
                  paddingVertical: 12,
                  backgroundColor: "rgba(181, 182, 182, 0.9)",
                }}
              >
                <AudioPlayer audioUri={selected?.audio_uri ?? ""} />
              </View>
            </BottomSheetFooter>
          )}
        >
          <BottomSheetView style={styles.bsViewContainer}>
            <BottomSheetScrollView contentContainerStyle={{ paddingBottom: footerHeight + 16 }}>
              <View
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  marginLeft: "auto",
                  alignItems: "center",
                }}
              >
                <Pressable
                  style={({ pressed }: { pressed: boolean }) => [{ opacity: pressed ? 0.6 : 1 }]}
                >
                  <MaterialIcons name="more-horiz" size={30} color="#555555" />
                </Pressable>
              </View>
              <View
                style={{ paddingHorizontal: 36 }}
                onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
              >
                <Text style={styles.bsMeta}>Title : {selected?.recording_title ?? "Untitled"}</Text>
                <Text style={styles.bsMeta}>
                  Duration : {formatSeconds(selected?.duration_ms ?? 0)}
                </Text>
                <Text style={styles.bsMeta}>
                  Time : {formatCreatedAtLocal(selected?.created_at ?? "null")}
                </Text>
                <Text style={styles.bsMeta}>
                  Location :{" "}
                  {selected?.lat == null || selected?.lng == null
                    ? "null"
                    : `${selected?.lat.toFixed(6)}, ${selected?.lng.toFixed(6)} (±${selected?.accuracy === null ? "?" : Math.floor(selected?.accuracy)} m)`}
                </Text>
                <Text style={styles.bsMeta}>Memo : {selected?.memo}</Text>
                <View
                  onLayout={(e) => {
                    const { y, height } = e.nativeEvent.layout;
                    setWaveformBottom(y + height);
                  }}
                >
                  <StaticWaveform
                    waveform={selected?.waveform_blob}
                    waveformLength={selected?.waveform_length}
                    waveformSampleIntervalMs={selected?.waveform_sample_interval_ms}
                  />
                </View>
                <PopupMenu
                  id={selected?.id}
                  audioUri={selected?.audio_uri}
                  title={selected?.recording_title}
                  memo={selected?.memo}
                />
              </View>
            </BottomSheetScrollView>
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B5B6B6",
    position: "relative",
  },
  searchBarWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: "#666666",
  },
  bottomSheetContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 20,
  },
  bottomSheetBackground: {
    backgroundColor: "#B5B6B6",
  },
  bsViewContainer: {
    flex: 1,
    // paddingHorizontal: 36,
    paddingBottom: 36,
  },
  bsMeta: {
    marginTop: 8,
    fontSize: 14,
    color: "#555555",
  },
});
