class CommentDetails {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, replies, likeCount, isDeleted,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
    this.replies = replies;
    this.likeCount = likeCount;
    this.isDeleted = isDeleted;
  }

  _verifyPayload({
    id, username, date, content, replies, likeCount, isDeleted,
  }) {
    if (
      !id || !username || !date || !content || !replies
      || likeCount === undefined || isDeleted === undefined
    ) {
      throw new Error('COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
        || typeof username !== 'string'
        || (typeof Date.parse(date)) !== 'number'
        || typeof content !== 'string'
        || replies.constructor !== Array
        || typeof likeCount !== 'number'
        || typeof isDeleted !== 'boolean'
    ) {
      throw new Error('COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentDetails;
