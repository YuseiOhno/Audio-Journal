import { LATEST_SCHEMA_SQL } from "./schema/latest";
import * as m001 from "./migrations/001_init";
import * as m002 from "./migrations/002_add_recording_meta";
import * as m003 from "./migrations/003_add_waveform_blob";

//migrationsファイルが増えるごとに下記配列追加
const MIGRATIONS = [m001, m002, m003];

export async function migrate(db: any) {
  const row = await db.getFirstAsync("PRAGMA user_version");
  const current = row?.user_version ?? 0;

  // 0: 新規インストール → 最新スキーマを一括作成
  if (current === 0) {
    await db.execAsync("BEGIN;");
    try {
      await db.execAsync(LATEST_SCHEMA_SQL);
      await db.execAsync("COMMIT;");
    } catch (e) {
      await db.execAsync("ROLLBACK;");
      throw e;
    }
    return;
  }

  // 1以上: 差分を順番に適用して最新へ
  for (const m of MIGRATIONS) {
    if (current < m.VERSION) {
      await db.execAsync("BEGIN;");
      try {
        await m.migrate(db);
        await db.execAsync("COMMIT;");
      } catch (e) {
        await db.execAsync("ROLLBACK;");
        throw e;
      }
    }
  }
}
