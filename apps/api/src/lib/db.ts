import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let dbPromise: Promise<any>;

// Create or connect to SQLite database
function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });
  }
  return dbPromise;
}

export const query = async (text: string, params: any[] = []) => {
  const db = await getDb();
  // Convert Postgres parameter syntax ($1, $2) to SQLite (?)
  const sqliteText = text.replace(/\$\d+/g, '?');
  // Execute and return rows to mimic pg's result.rows
  const rows = await db.all(sqliteText, params);
  return { rows };
};
