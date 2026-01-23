export const LATEST_VERSION = 0;

export const LATEST_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS recordings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date_key TEXT NOT NULL,
            created_at TEXT NOT NULL,
            audio_uri TEXT NOT NULL
    );

    PRAGMA user_version = ${LATEST_VERSION};
`;
