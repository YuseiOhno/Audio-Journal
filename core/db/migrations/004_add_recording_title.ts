export const VERSION = 4;

export async function migrate(db: any): Promise<void> {
  await db.execAsync(`
    ALTER TABLE recordings ADD COLUMN recording_title TEXT;

    PRAGMA user_version = ${VERSION};
  `);
}
