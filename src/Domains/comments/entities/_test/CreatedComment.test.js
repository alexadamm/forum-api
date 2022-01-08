const CreatedComment = require('../CreatedComment');

describe('a CreatedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'abc',
    };

    // Action & Assert
    expect(() => new CreatedComment(payload)).toThrowError('CREATED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });
  it('should throw error when palyoad did not meet data specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: true,
      owner: 'abc',
    };

    // Action & Assert
    expect(() => new CreatedComment(payload)).toThrowError('CREATED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
  it('should create createdComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'lorem ipsum dolor sit amet',
      owner: 'user-123',
    };

    // Action
    const { id, content, owner } = new CreatedComment(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
