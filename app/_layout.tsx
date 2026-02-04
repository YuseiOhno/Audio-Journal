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
          }}
        />
      </Stack>
    </TamaguiProvider>
  );
}
