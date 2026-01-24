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
