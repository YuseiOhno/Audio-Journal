export const VERSION = 3;

export async function migrate(db: any): Promise<void> {
  await db.execAsync(`
    ALTER TABLE recordings ADD COLUMN waveform_blob BLOB;
    ALTER TABLE recordings ADD COLUMN waveform_length INTEGER;
    ALTER TABLE recordings ADD COLUMN waveform_sample_interval_ms INTEGER;

    PRAGMA user_version = ${VERSION};
  `);
}
