const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(likeAct) {
    const { userId, commentId } = likeAct;
    const id = `like-${this._idGenerator(16)}`;

    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3) RETURNING id',
      values: [id, commentId, userId],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async verifyLikeExistance({ commentId, userId }) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, userId],
    };
    const result = await this._pool.query(query);

    if (result.rowCount) {
      return true;
    }
    return false;
  }

  async getLikesByCommentId(commentId) {
    const query = {
      text: `SELECT users.username
          FROM likes
          INNER JOIN users ON likes.owner = users.id
          WHERE comment_id = $1`,
      values: [commentId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteLikeByCommentIdAndUserId({ commentId, userId }) {
    const query = {
      text: 'DELETE FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, userId],
    };
    await this._pool.query(query);
  }
}

module.exports = LikeRepositoryPostgres;
