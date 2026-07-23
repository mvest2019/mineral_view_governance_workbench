// Answer repository — data access for GovernanceDB.answers.
//
// Extends BaseRepository and adds answer-specific queries.
//
// Phase 4 defines these methods; nothing invokes them yet (no app reads/writes).

import type { Filter, WithId } from 'mongodb';
import { ObjectId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import { auditedUpdate } from '@/src/models/base';
import type { AnswerDoc } from '@/src/models/answer.model';
import type { QuestionKind } from '@/src/constants/enums';

export class AnswerRepository extends BaseRepository<AnswerDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.ANSWERS, options);
  }

  /** List a question's answers, newest first. */
  async listByQuestion(
    questionCode: string,
    questionKind?: QuestionKind,
  ): Promise<WithId<AnswerDoc>[]> {
    const filter: Record<string, unknown> = { questionCode };
    if (questionKind) filter.questionKind = questionKind;
    const col = await this.collection();
    return col
      .find(this.scopedFilter(filter as Filter<AnswerDoc>))
      .sort({ answeredAt: -1 })
      .toArray();
  }

  /** List all answers authored by an employee, newest first. */
  async listByAuthor(answeredByKey: string): Promise<WithId<AnswerDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ answeredByKey } as Filter<AnswerDoc>))
      .sort({ answeredAt: -1 })
      .toArray();
  }

  /** Mark an answer accepted by an employee (sets acceptedByKey/acceptedAt). */
  async accept(
    id: string | ObjectId,
    acceptedByKey: string,
    actor: string,
  ): Promise<WithId<AnswerDoc> | null> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const audit = auditedUpdate({ actor });
    const col = await this.collection();
    return col.findOneAndUpdate(
      this.scopedFilter({ _id } as Filter<AnswerDoc>),
      {
        $set: { acceptedByKey, acceptedAt: new Date(), ...audit.set },
        $inc: audit.inc,
      },
      { returnDocument: 'after' },
    );
  }
}
