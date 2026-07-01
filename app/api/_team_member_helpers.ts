import {
  accept_team_member_questions,
  append_team_member_correspondence_event,
} from '@/lib/helpers';
import { nowIso } from '@/lib/http';

type Dict = Record<string, any>;

/**
 * Ported inline from governance_ui.py record_team_member_inline_answer (5315).
 * Records an inline answer for a team-member question, optionally accepting it.
 */
export function record_team_member_inline_answer(
  db: any,
  company: string,
  member_key: string,
  question_code: string,
  answer_markdown: string,
  accept = false,
  actor = 'Ryan',
): Dict | null {
  const row = db
    .prepare(
      'SELECT * FROM team_member_questions WHERE company=? AND team_member_key=? AND question_code=?',
    )
    .get(company, member_key, question_code);
  if (!row) {
    return null;
  }
  const now = nowIso();
  db.prepare(
    `INSERT INTO team_member_question_answers(
           question_id, answer_markdown, source_file_id, source_section,
           match_confidence, parsed_by, accepted_by_ryan, created_at
       ) VALUES(?,?,?,?,?,?,?,?)`,
  ).run(row.id, answer_markdown, 0, 'inline', 'HIGH', 'inline', 0, now);
  db.prepare(
    "UPDATE team_member_questions SET status='ANSWERED', updated_at=?, last_human_touch_at=? WHERE id=?",
  ).run(now, now, row.id);
  append_team_member_correspondence_event(
    db,
    company,
    member_key,
    'answer_saved',
    `Inline answer saved for ${question_code}.`,
    actor,
    null,
    row.id,
  );
  let accepted: string[] = [];
  if (accept) {
    accepted = accept_team_member_questions(db, company, member_key, [question_code], actor);
  }
  return {
    question_code,
    status: accepted.length ? 'APPROVED' : 'ANSWERED',
    accepted: accepted.length > 0,
  };
}
