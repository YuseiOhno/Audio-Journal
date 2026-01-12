import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#B5B6B6" },
        headerShadowVisible: false,
        headerTintColor: "#B5B6B6",
      }}
    />
  );
}
