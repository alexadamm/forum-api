class ReplyDetails {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, commentId, content, date, username, isDeleted,
    } = payload;

    this.id = id;
    this.commentId = commentId;
    this.content = content;
    this.date = date;
    this.username = username;
    this.isDeleted = isDeleted;
  }

  _verifyPayload({
    id, commentId, content, date, username, isDeleted,
  }) {
    if (!id || !commentId || !content || !date || !username || isDeleted === undefined) {
      throw new Error('REPLY_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
        || typeof commentId !== 'string'
        || typeof content !== 'string'
        || (typeof Date.parse(date)) !== 'number'
        || typeof username !== 'string'
        || typeof isDeleted !== 'boolean'
    ) {
      throw new Error('REPLY_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ReplyDetails;
