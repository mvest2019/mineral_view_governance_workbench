import { NextRequest } from 'next/server';
import { json, route } from '@/lib/http';
import { getDb } from '@/lib/db';
import { TEAM_MEMBER_PROFILES } from '@/lib/config';
import {
  list_employees,
  get_team_member_department_tags_map,
  list_meetings_for_company,
  build_questions_payload,
  get_team_member_profile,
  pretty_member_name,
  role_group,
  list_team_member_files,
  list_team_member_questions,
  list_team_member_question_packets,
  list_team_member_correspondence,
  summarize_team_member_question_statuses,
  question_is_unanswered,
  get_member_hub,
} from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company') as any;
  const db = getDb();
  const tag_map = get_team_member_department_tags_map(db, company);
  const recent_meetings = list_meetings_for_company(db, company, null, 30);
  const question_data = build_questions_payload(company);
  const by_member: Record<string, any> = {};
  const _profiles = TEAM_MEMBER_PROFILES[company] || {};
  let _order_keys = Object.keys(_profiles);
  if (_order_keys.includes('Ryan_Cochran')) {
    _order_keys = ['Ryan_Cochran', ..._order_keys.filter((k) => k !== 'Ryan_Cochran')];
  }
  const _roster_order: Record<string, number> = {};
  _order_keys.forEach((k, i) => {
    _roster_order[k] = i;
  });
  for (const member of list_employees(company)) {
    const _role = (String(get_team_member_profile(company, member).role || '')).trim();
    by_member[member] = {
      key: member,
      display_name: pretty_member_name(member),
      role: _role,
      group: role_group(_role),
      order: member in _roster_order ? _roster_order[member] : 9999,
      total_questions: 0,
      unanswered_questions: 0,
      assigned_intakes: 0,
      assigned_files: 0,
    };
  }

  for (const bucket of question_data.team_counts || []) {
    const member_key = bucket.key;
    if (!(member_key in by_member)) {
      by_member[member_key] = {
        key: member_key,
        display_name: bucket.display_name,
        total_questions: 0,
        unanswered_questions: 0,
        assigned_intakes: 0,
        assigned_files: 0,
      };
    }
    by_member[member_key].total_questions = bucket.total_count;
    by_member[member_key].unanswered_questions = bucket.unanswered_count;
  }

  for (const member_key of Object.keys(question_data.employees || {})) {
    if (!(member_key in by_member)) {
      by_member[member_key] = {
        key: member_key,
        display_name: pretty_member_name(member_key),
        total_questions: 0,
        unanswered_questions: 0,
        assigned_intakes: 0,
        assigned_files: 0,
      };
    }
  }

  const intake_rows = db
    .prepare(
      `SELECT i.employee, COUNT(DISTINCT i.id) AS intake_count, COALESCE(COUNT(f.id), 0) AS file_count
       FROM intake i
       LEFT JOIN intake_file f ON i.id = f.intake_id
       WHERE i.company=? AND i.employee IS NOT NULL AND i.employee <> ''
       GROUP BY i.employee`,
    )
    .all(company) as any[];
  for (const row of intake_rows) {
    const member_key = row.employee;
    if (!(member_key in by_member)) {
      by_member[member_key] = {
        key: member_key,
        display_name: pretty_member_name(member_key),
        total_questions: 0,
        unanswered_questions: 0,
        assigned_intakes: 0,
        assigned_files: 0,
      };
    }
    by_member[member_key].assigned_intakes = row.intake_count;
    by_member[member_key].assigned_files = row.file_count;
  }

  const member_file_counts = db
    .prepare(
      `SELECT member_key, COUNT(*) AS c
       FROM team_member_files
       WHERE company=?
       GROUP BY member_key`,
    )
    .all(company) as any[];
  for (const row of member_file_counts) {
    const member_key = row.member_key;
    if (!(member_key in by_member)) {
      by_member[member_key] = {
        key: member_key,
        display_name: pretty_member_name(member_key),
        total_questions: 0,
        unanswered_questions: 0,
        assigned_intakes: 0,
        assigned_files: 0,
      };
    }
    by_member[member_key].assigned_files += row.c;
  }

  const priority_order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, UNKNOWN: 4 };
  for (const member_key of Object.keys(by_member)) {
    const member = by_member[member_key];
    const profile = get_team_member_profile(company, member_key);
    const merged_set = new Set<string>(profile.departments || []);
    for (const row of tag_map[member_key] || []) {
      merged_set.add(row.department_key);
    }
    const merged_departments = Array.from(merged_set).sort();
    const display_name = member.display_name;
    const assigned_questions: any[] = [];
    for (const question of question_data.org_wide || []) {
      if (String(question.assignee || '').trim().toLowerCase() === String(display_name).toLowerCase()) {
        assigned_questions.push(question);
      }
    }
    const employee_bucket = (question_data.employees || {})[member_key] || { questions: [] };
    assigned_questions.push(...(employee_bucket.questions || []));
    assigned_questions.sort((a, b) => {
      const pa = priority_order[a.priority || 'UNKNOWN'] ?? 9;
      const pb = priority_order[b.priority || 'UNKNOWN'] ?? 9;
      if (pa !== pb) return pa - pb;
      const qa = a.qid || '';
      const qb = b.qid || '';
      return qa < qb ? -1 : qa > qb ? 1 : 0;
    });

    const priority_counts: Record<string, number> = {};
    for (const question of assigned_questions) {
      const priority = question.priority || 'UNKNOWN';
      priority_counts[priority] = (priority_counts[priority] || 0) + 1;
    }

    const assigned_intake_rows = db
      .prepare(
        `SELECT i.id, i.note, i.stage, i.source_type, i.uploaded_at, COUNT(f.id) AS file_count
         FROM intake i
         LEFT JOIN intake_file f ON i.id = f.intake_id
         WHERE i.company=? AND i.employee=?
         GROUP BY i.id
         ORDER BY i.uploaded_at DESC
         LIMIT 10`,
      )
      .all(company, member_key) as any[];
    const assigned_file_rows = db
      .prepare(
        `SELECT f.id, f.filename, f.saved_path, f.size_bytes, f.intake_id
         FROM intake_file f
         JOIN intake i ON i.id = f.intake_id
         WHERE i.company=? AND i.employee=?
         ORDER BY f.id DESC
         LIMIT 20`,
      )
      .all(company, member_key) as any[];
    const member_file_rows = list_team_member_files(db, company, member_key);
    const team_member_question_rows = list_team_member_questions(db, company, member_key);
    const team_member_packet_rows = list_team_member_question_packets(db, company, member_key);
    const team_member_correspondence_rows = list_team_member_correspondence(db, company, member_key, 25);
    const tm_question_counts = summarize_team_member_question_statuses(team_member_question_rows);
    const member_meetings: any[] = [];
    for (const meeting of recent_meetings) {
      const attendee_row = (meeting.attendees || []).find((r: any) => r.team_member_key === member_key);
      if (attendee_row) {
        member_meetings.push({
          id: meeting.id,
          title: meeting.title,
          meeting_type: meeting.meeting_type,
          meeting_date: meeting.meeting_date,
          note: meeting.note,
          notes_file_path: meeting.notes_file_path,
          follow_up_done: Boolean(attendee_row.follow_up_done),
          follow_up_note: attendee_row.follow_up_note || '',
          attendee_count: meeting.attendee_count || 0,
        });
      }
    }

    member.detail = {
      key: member_key,
      display_name: display_name,
      role: profile.role || '',
      purpose: profile.purpose || '',
      departments: merged_departments,
      manual_department_tags: (tag_map[member_key] || []).map((row: any) => row.department_key),
      repos: profile.repos || [],
      operating_sources: profile.operating_sources || [],
      question_total: assigned_questions.length,
      question_unanswered: assigned_questions.filter((q) => question_is_unanswered(q.status)).length,
      priority_counts: priority_counts,
      assigned_intakes: member.assigned_intakes,
      assigned_files: member.assigned_files,
      top_questions: assigned_questions.slice(0, 8),
      assigned_intake_items: assigned_intake_rows,
      assigned_file_items: assigned_file_rows,
      member_file_items: member_file_rows,
      member_file_count: member_file_rows.length,
      team_member_questions: team_member_question_rows,
      team_member_question_counts: tm_question_counts,
      team_member_question_packets: team_member_packet_rows,
      team_member_correspondence: team_member_correspondence_rows,
      recent_meetings: member_meetings.slice(0, 8),
      meeting_count_30d: member_meetings.length,
      member_hub: get_member_hub(company, member_key),
      daily_tasks: [],
      task_lanes: [],
      critical_rules: [],
      immutable_rules: [],
      workspace_sources: [],
    };

    member.debug_version = 'team-members-v2';
  }

  const result = Object.values(by_member).sort((a: any, b: any) => {
    if (a.unanswered_questions !== b.unanswered_questions) {
      return b.unanswered_questions - a.unanswered_questions;
    }
    return a.display_name < b.display_name ? -1 : a.display_name > b.display_name ? 1 : 0;
  });
  return json(result);
});
