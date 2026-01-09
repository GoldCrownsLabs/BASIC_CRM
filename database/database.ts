import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("base_crm.db");

export const initDB = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY,
        title TEXT,
        description TEXT,
        status TEXT,
        updated_at TEXT,
        is_synced INTEGER
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        payload TEXT
      );
    `);

    console.log("✅ SQLite DB initialized");
  } catch (error) {
    console.error("❌ DB Init Error:", error);
  }
};
