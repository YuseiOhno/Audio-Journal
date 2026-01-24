export const VERSION = 1;

export async function migrate(db: any): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recordings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_key TEXT NOT NULL,
      created_at TEXT NOT NULL,
      audio_uri TEXT NOT NULL
    );

    PRAGMA user_version = ${VERSION};
    `);
}
