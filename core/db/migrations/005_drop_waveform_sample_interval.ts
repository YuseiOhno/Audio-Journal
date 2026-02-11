export const VERSION = 5;

export async function migrate(db: any): Promise<void> {
  await db.execAsync(`
    ALTER TABLE recordings RENAME TO recordings_old;

    CREATE TABLE recordings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_key TEXT NOT NULL,
      created_at TEXT NOT NULL,
      audio_uri TEXT NOT NULL,
      duration_ms INTEGER,
      lat REAL,
      lng REAL,
      accuracy REAL,
      memo TEXT,
      waveform_blob BLOB,
      waveform_length INTEGER,
      recording_title TEXT
    );

    INSERT INTO recordings (
      id,
      date_key,
      created_at,
      audio_uri,
      duration_ms,
      lat,
      lng,
      accuracy,
      memo,
      waveform_blob,
      waveform_length,
      recording_title
    )
    SELECT
      id,
      date_key,
      created_at,
      audio_uri,
      duration_ms,
      lat,
      lng,
      accuracy,
      memo,
      waveform_blob,
      waveform_length,
      recording_title
    FROM recordings_old;

    DROP TABLE recordings_old;

    PRAGMA user_version = ${VERSION};
  `);
}
