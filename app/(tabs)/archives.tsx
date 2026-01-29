import { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Archives() {
  const [query, setQuery] = useState("");
  const { top } = useSafeAreaInsets();
  const searchBarHeight = 38;
  const searchBarMargin = 20;

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
});
