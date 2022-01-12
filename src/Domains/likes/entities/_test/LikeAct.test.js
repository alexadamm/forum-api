const LikeAct = require('../LikeAct');

describe('a LikeAct entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      userId: 'abc',
    };

    // Action & Assert
    expect(() => new LikeAct(payload)).toThrowError('LIKE_ACT.NOT_CONTAIN_NEEDED_PROPERTY');
  });
  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      userId: 123,
      commentId: true,
    };

    // Action & Assert
    expect(() => new LikeAct(payload)).toThrowError('LIKE_ACT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
  it('should create likeAct object correctly', () => {
    // Arrange
    const payload = {
      userId: 'user-123',
      commentId: 'comment-123',
    };

    // Action
    const { userId, commentId } = new LikeAct(payload);

    // Assert
    expect(userId).toEqual(payload.userId);
    expect(commentId).toEqual(payload.commentId);
  });
});
