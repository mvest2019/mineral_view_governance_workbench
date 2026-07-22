import type Database from 'better-sqlite3';

/** Port of ensure_aspect_group_reviews_table (governance_ui.py:5007). */
export function ensure_aspect_group_reviews_table(db: Database.Database): void {
  db.exec(`
        CREATE TABLE IF NOT EXISTS aspect_group_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            group_name TEXT NOT NULL,
            decision TEXT NOT NULL DEFAULT 'CONFIRMED',
            reviewer TEXT NOT NULL,
            note TEXT,
            reviewed_at TEXT NOT NULL,
            UNIQUE(company, group_name)
        )
    `);
}
