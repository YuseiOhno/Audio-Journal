export const VERSION = 1;

export async function migrate(db: any): Promise<void> {
  await db.execAsync(`
    PROGMA user_version = ${VERSION};
    `);
}
