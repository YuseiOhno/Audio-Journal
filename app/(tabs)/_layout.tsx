import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, TouchableOpacity } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTintColor: "#333333",
        headerStyle: { backgroundColor: "#B5B6B6" },
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: "#B5B6B6", borderTopWidth: 0, paddingTop: 10 },
        tabBarActiveTintColor: "#333333",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "pulse-sharp" : "pulse-outline"} color={color} size={30} />
          ),
        }}
      />
      <Tabs.Screen
        name="archives"
        options={{
          headerShown: false,
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "library-sharp" : "library-outline"}
              color={color}
              size={30}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="edit"
        options={{
          title: "タイトルとメモを追加",
          href: null,
          tabBarStyle: { display: "none" },
          headerRight: () => (
            <TouchableOpacity
              style={{
                backgroundColor: "rgba(230, 230, 230, 0.3)",
                height: 36,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
                marginBottom: 6,
              }}
            >
              <Ionicons name="save-outline" size={22} color="#333333" />
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity
              style={{
                backgroundColor: "rgba(230, 230, 230, 0.3)",
                height: 36,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 16,
                marginBottom: 6,
              }}
            >
              <Ionicons name="chevron-back-outline" size={22} color="#333333" />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
