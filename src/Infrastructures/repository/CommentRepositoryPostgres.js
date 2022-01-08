const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const CommentDetails = require('../../Domains/comments/entities/CommentDetails');
const CreatedComment = require('../../Domains/comments/entities/CreatedComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(createComment) {
    const { threadId, content, owner } = createComment;
    const id = `comment-${this._idGenerator(16)}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, threadId, content, owner],
    };

    const result = await this._pool.query(query);

    return new CreatedComment({ ...result.rows[0] });
  }

  async verifyCommentExistance({ commentId, threadId }) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Comment tidak ditemukan');
    }
  }

  async verifyCommentAccessibility({ commentId, userId }) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('Anda bukan pemilik comment ini');
    }
  }

  async deleteCommentById(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id,
        comments.date, comments.content,
        comments.is_deleted, users.username
        FROM comments INNER JOIN users
        ON comments.owner = users.id
        WHERE comments.thread_id = $1
        ORDER BY comments.date ASC`,
      values: [threadId],
    };

    const results = await this._pool.query(query);

    return results.rows
      .map((comment) => new CommentDetails({
        ...comment, replies: [], likeCount: 0, isDeleted: comment.is_deleted,
      }));
  }
}

module.exports = CommentRepositoryPostgres;
