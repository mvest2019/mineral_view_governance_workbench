import Database from 'better-sqlite3';
import { DB_PATH } from './paths';

let _db: Database.Database | null = null;
let _initialized = false;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS intake (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    employee TEXT,
    uploaded_at TEXT NOT NULL,
    source_type TEXT,
    ai_engines TEXT,
    note TEXT,
    stage TEXT NOT NULL DEFAULT 'Uploaded',
    blocker TEXT
);
CREATE TABLE IF NOT EXISTS intake_file (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intake_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    saved_path TEXT NOT NULL,
    size_bytes INTEGER,
    FOREIGN KEY(intake_id) REFERENCES intake(id)
);
CREATE TABLE IF NOT EXISTS workflow_event (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intake_id INTEGER NOT NULL,
    stage TEXT NOT NULL,
    ts TEXT NOT NULL,
    actor TEXT,
    note TEXT,
    FOREIGN KEY(intake_id) REFERENCES intake(id)
);
CREATE TABLE IF NOT EXISTS gate (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intake_id INTEGER NOT NULL,
    gate_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Not Started',
    approver TEXT,
    decided_at TEXT,
    note TEXT,
    FOREIGN KEY(intake_id) REFERENCES intake(id),
    UNIQUE(intake_id, gate_name)
);
CREATE TABLE IF NOT EXISTS link (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intake_id INTEGER NOT NULL,
    kind TEXT NOT NULL,
    ref TEXT NOT NULL,
    FOREIGN KEY(intake_id) REFERENCES intake(id)
);
CREATE TABLE IF NOT EXISTS repo_classification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    observed_purpose TEXT,
    proposed_category TEXT,
    confidence TEXT,
    canonical_status TEXT,
    evidence TEXT,
    finding_link TEXT,
    question_link TEXT,
    approval_status TEXT DEFAULT 'PENDING',
    updated_at TEXT,
    UNIQUE(company, repo_name)
);
CREATE TABLE IF NOT EXISTS ai_run (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intake_id INTEGER NOT NULL,
    engine TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    prompt_text TEXT,
    output_text TEXT,
    output_path TEXT,
    error_text TEXT,
    FOREIGN KEY(intake_id) REFERENCES intake(id)
);
CREATE TABLE IF NOT EXISTS ai_exchange (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intake_id INTEGER NOT NULL,
    topic TEXT,
    source_engine TEXT NOT NULL,
    target_engine TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    source_run_id INTEGER,
    source_prompt TEXT,
    source_output TEXT,
    source_output_path TEXT,
    target_prompt TEXT,
    target_output TEXT,
    target_output_path TEXT,
    agreement_status TEXT DEFAULT 'Needs review',
    next_action TEXT DEFAULT 'Hold',
    error_text TEXT,
    FOREIGN KEY(intake_id) REFERENCES intake(id),
    FOREIGN KEY(source_run_id) REFERENCES ai_run(id)
);
CREATE TABLE IF NOT EXISTS question_assignment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    qid TEXT NOT NULL,
    assignee TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    note TEXT,
    UNIQUE(company, qid)
);
CREATE TABLE IF NOT EXISTS repo_understanding (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    department_key TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'UNKNOWN',
    review_note TEXT,
    next_questions_note TEXT,
    reviewed_by TEXT,
    updated_at TEXT NOT NULL,
    UNIQUE(company, department_key, repo_name)
);
CREATE TABLE IF NOT EXISTS finding_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    fid TEXT NOT NULL,
    decision TEXT NOT NULL DEFAULT 'REVIEWED',
    reviewer TEXT NOT NULL,
    note TEXT,
    reviewed_at TEXT NOT NULL,
    UNIQUE(company, fid)
);
CREATE TABLE IF NOT EXISTS repo_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    question_code TEXT NOT NULL,
    title TEXT NOT NULL,
    body_markdown TEXT NOT NULL,
    short_question TEXT,
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    status TEXT NOT NULL DEFAULT 'OPEN',
    source TEXT NOT NULL,
    source_ref TEXT NOT NULL,
    source_excerpt TEXT,
    primary_assignee TEXT,
    answer_markdown TEXT,
    review_note TEXT,
    reviewed_by TEXT,
    created_by TEXT NOT NULL DEFAULT 'generator',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(company, question_code)
);
CREATE INDEX IF NOT EXISTS idx_repo_questions_company_repo
    ON repo_questions(company, repo_name);
CREATE INDEX IF NOT EXISTS idx_repo_questions_company_priority
    ON repo_questions(company, priority, updated_at);
CREATE TABLE IF NOT EXISTS team_member_department_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    member_key TEXT NOT NULL,
    department_key TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual',
    note TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(company, member_key, department_key)
);
CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    meeting_type TEXT NOT NULL DEFAULT 'other',
    organizer TEXT,
    meeting_date TEXT NOT NULL,
    note TEXT,
    notes_file_path TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS meeting_attendees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    team_member_key TEXT,
    external_name TEXT,
    external_email TEXT,
    attended INTEGER NOT NULL DEFAULT 1,
    follow_up_done INTEGER NOT NULL DEFAULT 0,
    follow_up_note TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(meeting_id) REFERENCES meetings(id)
);
CREATE TABLE IF NOT EXISTS meeting_action_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    owner_key TEXT,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(meeting_id) REFERENCES meetings(id)
);
CREATE TABLE IF NOT EXISTS team_member_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    member_key TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    saved_path TEXT NOT NULL,
    source_type TEXT NOT NULL DEFAULT 'document',
    note TEXT,
    ai_preference TEXT NOT NULL DEFAULT 'Claude',
    size_bytes INTEGER,
    uploaded_at TEXT NOT NULL,
    uploaded_by TEXT NOT NULL DEFAULT 'user'
);
CREATE TABLE IF NOT EXISTS team_member_file_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_file_id INTEGER NOT NULL,
    engine TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    doc_kind TEXT,
    confidence TEXT,
    summary_text TEXT,
    suggested_departments_json TEXT,
    raw_output_text TEXT,
    error_text TEXT,
    FOREIGN KEY(member_file_id) REFERENCES team_member_files(id)
);
CREATE TABLE IF NOT EXISTS team_member_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    team_member_key TEXT NOT NULL,
    question_code TEXT NOT NULL,
    title TEXT,
    body_markdown TEXT,
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    status TEXT NOT NULL DEFAULT 'NEW',
    source_file_id INTEGER,
    source_section TEXT,
    generated_by TEXT NOT NULL DEFAULT 'manual',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_human_touch_at TEXT,
    UNIQUE(company, question_code),
    FOREIGN KEY(source_file_id) REFERENCES team_member_files(id)
);
CREATE INDEX IF NOT EXISTS idx_team_member_questions_company_member
    ON team_member_questions(company, team_member_key, status, updated_at);
CREATE TABLE IF NOT EXISTS team_member_question_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    answer_markdown TEXT,
    source_file_id INTEGER NOT NULL,
    source_section TEXT,
    match_confidence TEXT NOT NULL DEFAULT 'LOW',
    parsed_by TEXT NOT NULL DEFAULT 'manual',
    accepted_by_ryan INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(question_id) REFERENCES team_member_questions(id),
    FOREIGN KEY(source_file_id) REFERENCES team_member_files(id)
);
CREATE INDEX IF NOT EXISTS idx_tm_question_answers_question
    ON team_member_question_answers(question_id, created_at);
CREATE TABLE IF NOT EXISTS team_member_question_packets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    team_member_key TEXT NOT NULL,
    packet_version INTEGER NOT NULL,
    question_ids_json TEXT NOT NULL,
    exported_file_path TEXT NOT NULL,
    exported_at TEXT NOT NULL,
    exported_by TEXT NOT NULL DEFAULT 'Ryan',
    UNIQUE(company, team_member_key, packet_version)
);
CREATE TABLE IF NOT EXISTS team_member_correspondence_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    team_member_key TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_summary TEXT NOT NULL,
    actor TEXT NOT NULL,
    linked_file_id INTEGER,
    linked_question_id INTEGER,
    linked_packet_id INTEGER,
    created_at TEXT NOT NULL,
    FOREIGN KEY(linked_file_id) REFERENCES team_member_files(id),
    FOREIGN KEY(linked_question_id) REFERENCES team_member_questions(id),
    FOREIGN KEY(linked_packet_id) REFERENCES team_member_question_packets(id)
);
CREATE INDEX IF NOT EXISTS idx_tm_correspondence_company_member
    ON team_member_correspondence_log(company, team_member_key, created_at, id);
CREATE TABLE IF NOT EXISTS team_member_question_ai_run (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_member_key TEXT NOT NULL,
    company TEXT NOT NULL,
    engine TEXT NOT NULL,
    action_type TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    input_file_id INTEGER,
    prompt_text TEXT,
    output_text TEXT,
    output_path TEXT,
    error_text TEXT,
    FOREIGN KEY(input_file_id) REFERENCES team_member_files(id)
);
`;

function columnNames(db: Database.Database, table: string): Set<string> {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return new Set(rows.map((r) => r.name));
}

function runMigrations(db: Database.Database): void {
  const tmFiles = columnNames(db, 'team_member_files');
  if (!tmFiles.has('file_purpose'))
    db.exec("ALTER TABLE team_member_files ADD COLUMN file_purpose TEXT NOT NULL DEFAULT 'other'");
  if (!tmFiles.has('linked_question_packet_id'))
    db.exec('ALTER TABLE team_member_files ADD COLUMN linked_question_packet_id INTEGER');
  if (!tmFiles.has('parsed_answer_count'))
    db.exec('ALTER TABLE team_member_files ADD COLUMN parsed_answer_count INTEGER NOT NULL DEFAULT 0');
  if (!tmFiles.has('generated_question_count'))
    db.exec('ALTER TABLE team_member_files ADD COLUMN generated_question_count INTEGER NOT NULL DEFAULT 0');

  const meetings = columnNames(db, 'meetings');
  if (!meetings.has('summary_text')) db.exec('ALTER TABLE meetings ADD COLUMN summary_text TEXT');
  if (!meetings.has('summary_status'))
    db.exec("ALTER TABLE meetings ADD COLUMN summary_status TEXT NOT NULL DEFAULT 'none'");
  if (!meetings.has('summary_engine')) db.exec('ALTER TABLE meetings ADD COLUMN summary_engine TEXT');
  if (!meetings.has('priority_questions_json'))
    db.exec('ALTER TABLE meetings ADD COLUMN priority_questions_json TEXT');
  if (!meetings.has('summary_generated_at'))
    db.exec('ALTER TABLE meetings ADD COLUMN summary_generated_at TEXT');
}

export function initDb(db: Database.Database): void {
  db.exec(SCHEMA);
  runMigrations(db);
}

/** Return the shared better-sqlite3 connection, initialising the schema once. */
export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
  }
  if (!_initialized) {
    initDb(_db);
    _initialized = true;
  }
  return _db;
}
