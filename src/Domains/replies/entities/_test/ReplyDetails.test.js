const ReplyDetails = require('../ReplyDetails');

describe('a ReplyDetails entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'abc',
      commentId: 'abc',
      content: 'abc',
      date: '2022',
      username: 'abc',
    };

    // Action & Assert
    expect(() => new ReplyDetails(payload)).toThrowError('REPLY_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
  });
  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      commentId: true,
      content: {},
      date: ['2022'],
      username: 'abc',
      isDeleted: {},
    };

    // Action & Assert
    expect(() => new ReplyDetails(payload)).toThrowError('REPLY_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
  it('should create replyDetails object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      commentId: 'comment-123',
      content: 'lorem ipsum dolor sit amet',
      date: '2022',
      username: 'dicoding',
      isDeleted: true,
    };

    // Action
    const replyDetails = new ReplyDetails(payload);

    // Assert
    expect(replyDetails.id).toEqual(payload.id);
    expect(replyDetails.commentId).toEqual(payload.commentId);
    expect(replyDetails.content).toEqual(payload.content);
    expect(replyDetails.date).toEqual(payload.date);
    expect(replyDetails.username).toEqual(payload.username);
    expect(replyDetails.isDeleted).toEqual(payload.isDeleted);
  });
});
