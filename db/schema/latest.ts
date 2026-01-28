//migrateの度に更新
export const LATEST_VERSION = 3;

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
        memo TEXT,
        waveform_sample_interval_ms INTEGER,
        waveform_blob BLOB,
        waveform_length INTEGER
    );

    PRAGMA user_version = ${LATEST_VERSION};
`;
