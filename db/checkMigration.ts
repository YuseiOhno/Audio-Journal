const EXPECTED_COLUMNS = [
  "id",
  "date_key",
  "created_at",
  "audio_uri",
  "duration_ms",
  "lat",
  "lng",
  "accuracy",
  "location_at",
  "memo",
];

export async function checkMigration(db: any) {
  const tables = await db.getAllAsync(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  );
  const versionRow = await db.getFirstAsync("PRAGMA user_version");
  const columns = await db.getAllAsync("PRAGMA table_info(recordings)");
  const columnNames = new Set((columns ?? []).map((c: any) => c.name));
  const missingColumns = EXPECTED_COLUMNS.filter((name) => !columnNames.has(name));

  console.log("sqlite tables:", tables);
  console.log("sqlite user_version:", versionRow?.user_version);
  console.log("recordings columns:", columns);
  console.log("missing columns:", missingColumns);

  return {
    tables,
    userVersion: versionRow?.user_version,
    columns,
    missingColumns,
  };
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
