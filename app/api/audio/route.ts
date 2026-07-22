import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { get_company, list_employees, pretty_member_name } from '@/lib/helpers';
import { getDb } from '@/lib/db';
import { abort, json, route } from '@/lib/http';
import {
  governance_base_dir,
  transcribe_audio,
  generate_voice_memo_intelligence,
} from '@/app/api/_content_helpers';

export const dynamic = 'force-dynamic';

function tsStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export const POST = route(async (req: NextRequest) => {
  const form = await req.formData();
  const company = form.get('company') as string | null;
  const rawLabel = (form.get('label') as string | null) || 'memo';
  const label = (rawLabel || 'memo').replace(/\//g, '_').replace(/\\/g, '_');
  const cfg = get_company(company as string);
  const audio = form.get('audio');
  if (!(audio instanceof File)) abort(400);
  const audioFile = audio as File;
  const memos_dir = path.join(governance_base_dir(cfg), '_VOICE_MEMOS');
  fs.mkdirSync(memos_dir, { recursive: true });
  const ts = tsStamp();
  const filename = `${ts}_${label}.webm`;
  const out_path = path.join(memos_dir, filename);
  fs.writeFileSync(out_path, Buffer.from(await audioFile.arrayBuffer()));

  const context_json = form.get('context_json') as string | null;
  let context_path: string | null = null;
  let linked_questions: any[] = [];
  if (context_json) {
    try {
      const context_payload = JSON.parse(context_json);
      if (context_payload && typeof context_payload === 'object' && !Array.isArray(context_payload)) {
        linked_questions = context_payload.question_ids || [];
        context_path = path.join(memos_dir, `${ts}_${label}.json`);
        fs.writeFileSync(context_path, JSON.stringify(context_payload, null, 2), 'utf-8');
      }
    } catch {
      context_path = null;
    }
  }

  // Resolve a routing target: explicit member_key, else match label to a member.
  const db = getDb();
  let member_key = (form.get('member_key') as string | null) || null;
  if (!member_key) {
    const label_norm = label.replace(/_/g, ' ').trim().toLowerCase();
    for (const k of list_employees(company as string)) {
      if (k.toLowerCase() === label.toLowerCase() || pretty_member_name(k).toLowerCase() === label_norm) {
        member_key = k;
        break;
      }
    }
  }

  // Transcribe + summarize + generate priority questions.
  const [transcript, transcript_error] = await transcribe_audio(out_path);
  let intel: any = { summary: '', questions: [], questions_created: 0, engine: null };
  if (transcript) {
    intel = await generate_voice_memo_intelligence(db, company as string, label, transcript, member_key);
    try {
      fs.writeFileSync(path.join(memos_dir, `${ts}_${label}.transcript.txt`), transcript, 'utf-8');
      fs.writeFileSync(
        path.join(memos_dir, `${ts}_${label}.intel.json`),
        JSON.stringify(intel, null, 2),
        'utf-8',
      );
    } catch {
      // ignore
    }
  }

  return json({
    saved: String(out_path),
    filename,
    context_saved: context_path ? String(context_path) : null,
    linked_questions,
    linked_count: linked_questions.length,
    routed_member: member_key ? pretty_member_name(member_key) : null,
    transcript: transcript || '',
    transcript_error,
    summary: intel.summary || '',
    questions: intel.questions || [],
    questions_created: intel.questions_created || 0,
    engine: intel.engine,
  });
});
