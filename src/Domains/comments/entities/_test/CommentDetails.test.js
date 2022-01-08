const CommentDetails = require('../CommentDetails');

describe('a CommentDetails entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'abc',
      username: 'abc',
      date: '2022',
      content: 'abc',
    };

    // Action & Assert
    expect(() => new CommentDetails(payload)).toThrowError('COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
  });
  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: true,
      date: 2022,
      content: {},
      replies: 'abc',
      likeCount: 'abc',
      isDeleted: [false],
    };

    // Action & Assert
    expect(() => new CommentDetails(payload)).toThrowError('COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
  it('should create commentDetails object correctly', () => {
    // Arrange
    const payload = {
      id: 'abc',
      username: 'abc',
      date: '2022',
      content: 'abc',
      replies: [],
      likeCount: 0,
      isDeleted: false,
    };

    // Action
    const commentDetails = new CommentDetails(payload);

    // Assert
    expect(commentDetails.id).toEqual(payload.id);
    expect(commentDetails.username).toEqual(payload.username);
    expect(commentDetails.date).toEqual(payload.date);
    expect(commentDetails.content).toEqual(payload.content);
    expect(commentDetails.replies).toEqual(payload.replies);
    expect(commentDetails.likeCount).toEqual(payload.likeCount);
    expect(commentDetails.isDeleted).toEqual(payload.isDeleted);
  });
});
