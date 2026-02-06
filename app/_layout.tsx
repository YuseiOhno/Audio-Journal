import { Stack } from "expo-router";
import { useState, useEffect } from "react";
import { initDB } from "@/core/db";
import { TamaguiProvider } from "@tamagui/core";
import { config } from "@/tamagui.config";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDB();
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return null; // ← SplashScreenを使ってもOK
  }
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="edit"
          options={{
            title: "タイトルとメモを追加",
            headerStyle: { backgroundColor: "#B5B6B6" },
            headerTintColor: "#333333",
            headerShadowVisible: false,
            animation: "slide_from_bottom",
            contentStyle: { backgroundColor: "#B5B6B6" },
          }}
        />
      </Stack>
    </TamaguiProvider>
  );
}
