import { Stack } from "expo-router";
import { useState, useEffect } from "react";
import { db, initDB } from "@/db";
import { checkMigration } from "@/db/checkMigration";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDB();
      checkMigration(db);
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

[
  { cid: 0, dflt_value: null, name: "id", notnull: 0, pk: 1, type: "INTEGER" },
  { cid: 1, dflt_value: null, name: "date_key", notnull: 1, pk: 0, type: "TEXT" },
  { cid: 2, dflt_value: null, name: "created_at", notnull: 1, pk: 0, type: "TEXT" },
  { cid: 3, dflt_value: null, name: "audio_uri", notnull: 1, pk: 0, type: "TEXT" },
  { cid: 4, dflt_value: null, name: "duration_ms", notnull: 0, pk: 0, type: "INTEGER" },
  { cid: 5, dflt_value: null, name: "lat", notnull: 0, pk: 0, type: "REAL" },
  { cid: 6, dflt_value: null, name: "lng", notnull: 0, pk: 0, type: "REAL" },
  { cid: 7, dflt_value: null, name: "accuracy", notnull: 0, pk: 0, type: "REAL" },
  { cid: 8, dflt_value: null, name: "location_at", notnull: 0, pk: 0, type: "TEXT" },
  { cid: 9, dflt_value: null, name: "memo", notnull: 0, pk: 0, type: "TEXT" },
];
