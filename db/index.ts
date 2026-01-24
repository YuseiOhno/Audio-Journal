import * as SQLite from "expo-sqlite";
import { migrate } from "./migrate";

export const db = SQLite.openDatabaseSync("app_db");

export async function initDB() {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);
  await migrate(db);
}
