class LikeAct {
  constructor(payload) {
    this._verifyPayload(payload);

    const { userId, commentId } = payload;

    this.userId = userId;
    this.commentId = commentId;
  }

  _verifyPayload({ userId, commentId }) {
    if (!userId || !commentId) {
      throw new Error('LIKE_ACT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof userId !== 'string' || typeof commentId !== 'string') {
      throw new Error('LIKE_ACT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = LikeAct;
