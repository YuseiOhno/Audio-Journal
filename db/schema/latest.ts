//migrateの度に更新
export const LATEST_VERSION = 4;

export const LATEST_SCHEMA_SQL = `
    CREATE TABLE IF NOT EXISTS recordings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date_key TEXT NOT NULL,
        created_at TEXT NOT NULL,
        audio_uri TEXT NOT NULL,
        duration_ms INTEGER,
        lat REAL,
        lng REAL,
        accuracy REAL,
        memo TEXT DEFAULT "N/A",
        waveform_sample_interval_ms INTEGER,
        waveform_blob BLOB,
        waveform_length INTEGER,
        recording_title TEXT DEFAULT "Untitled"
    );

    PRAGMA user_version = ${LATEST_VERSION};
`;
