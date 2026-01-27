import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTintColor: "#B5B6B6",
        headerStyle: { backgroundColor: "#B5B6B6" },
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: "#B5B6B6", borderTopWidth: 0 },
        tabBarActiveTintColor: "#333333",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "REC",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "pulse-sharp" : "pulse-outline"} color={color} size={30} />
          ),
        }}
      />
      <Tabs.Screen
        name="archives"
        options={{
          title: "archives",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "library-sharp" : "library-outline"}
              color={color}
              size={30}
            />
          ),
        }}
      />
    </Tabs>
  );
}
