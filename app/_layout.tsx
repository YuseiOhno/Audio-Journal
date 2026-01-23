import { Stack } from "expo-router";
import { useState, useEffect } from "react";
import { initDB } from "@/db";

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
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#B5B6B6" },
        headerShadowVisible: false,
        headerTintColor: "#B5B6B6",
      }}
    />
  );
}
