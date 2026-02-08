import { RefObject, useMemo } from "react";
import { Animated, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";

type Props = {
  topInset: number;
  searchBarHeight: number;
  searchBarMargin: number;
  query: string;
  onQueryChange: (value: string) => void;
  onPressSort: () => void;
  inputRef: RefObject<TextInput | null>;
  headerOpacity: Animated.AnimatedInterpolation<number>;
};

export default function SearchBar({
  topInset,
  searchBarHeight,
  searchBarMargin,
  query,
  onQueryChange,
  onPressSort,
  inputRef,
  headerOpacity,
}: Props) {
  const AnimatedBlurView = useMemo(() => Animated.createAnimatedComponent(BlurView), []);

  return (
    <View style={[styles.searchBarWrap, { paddingTop: topInset + searchBarMargin }]}>
      <AnimatedBlurView
        intensity={20}
        tint="light"
        style={[StyleSheet.absoluteFillObject, { opacity: headerOpacity }]}
        pointerEvents="none"
      />
      <View style={[styles.searchBar, { height: searchBarHeight }]}>
        <Ionicons name="search-outline" size={18} color="#666666" />
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={onQueryChange}
          placeholder="Search"
          placeholderTextColor="#9A9A9A"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          style={styles.searchInput}
        />
      </View>
      <TouchableOpacity
        onPress={onPressSort}
        style={[styles.sortButton, { height: searchBarHeight, width: searchBarHeight }]}
      >
        <Ionicons name="funnel-outline" size={18} color="#666666" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
