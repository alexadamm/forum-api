const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CreatedReply = require('../../Domains/replies/entities/CreatedReply');
const ReplyDetails = require('../../Domains/replies/entities/ReplyDetails');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(createReply) {
    const { commentId, owner, content } = createReply;
    const id = `reply-${this._idGenerator(16)}`;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, commentId, content, owner],
    };

    const result = await this._pool.query(query);

    return new CreatedReply({ ...result.rows[0] });
  }

  async verifyReplyExistance({ replyId, commentId, threadId }) {
    const query = {
      text: `SELECT replies.*
      FROM replies INNER JOIN comments
      ON replies.comment_id = comments.id
      WHERE replies.id = $1
      AND replies.comment_id = $2
      AND comments.thread_id = $3
      AND replies.is_deleted = false`,

      values: [replyId, commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Reply tidak ditemukan');
    }
  }

  async verifyReplyAccessibility({ userId, replyId }) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND owner = $2',
      values: [replyId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('Anda bukan pemilik reply ini');
    }
  }

  async deleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: `SELECT replies.id,
        replies.date, replies.content,
        replies.is_deleted, replies.comment_id, 
        users.username
        FROM replies 
        INNER JOIN comments ON replies.comment_id = comments.id
        INNER JOIN users ON replies.owner = users.id
        WHERE comments.thread_id = $1
        ORDER BY replies.date ASC`,
      values: [threadId],
    };

    const results = await this._pool.query(query);

    return results.rows.map((reply) => new ReplyDetails({
      ...reply, commentId: reply.comment_id, isDeleted: reply.is_deleted,
    }));
  }
}

module.exports = ReplyRepositoryPostgres;
