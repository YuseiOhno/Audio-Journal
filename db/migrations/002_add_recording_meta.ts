export const VERSION = 2;

export async function migrate(db: any): Promise<void> {
  await db.execAsync(`
    ALTER TABLE recordings ADD COLUMN duration_ms INTEGER;
    ALTER TABLE recordings ADD COLUMN lat REAL;
    ALTER TABLE recordings ADD COLUMN lng REAL;
    ALTER TABLE recordings ADD COLUMN accuracy REAL;
    ALTER TABLE recordings ADD COLUMN location_at TEXT;
    ALTER TABLE recordings ADD COLUMN memo TEXT;

    PRAGMA user_version = ${VERSION};
  `);
}
