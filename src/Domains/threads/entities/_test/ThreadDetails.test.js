const ThreadDetails = require('../ThreadDetails');

describe('a ThreadDetails entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Sebuah Utas',
      date: '2022',
      username: 'dicoding',
      comments: [],
    };

    // Action & Assert
    expect(() => new ThreadDetails(payload)).toThrowError('THREAD_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
  });
  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: true,
      body: {},
      date: [],
      username: 'abc',
      comments: [],
    };

    // Action & Assert
    expect(() => new ThreadDetails(payload)).toThrowError('THREAD_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
  it('should create threadDetails object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Sebuah Utas',
      body: 'lorem ipsum',
      date: '2022',
      username: 'dicoding',
      comments: [],
    };

    // Action
    const threadDetails = new ThreadDetails(payload);

    // Arrange
    expect(threadDetails).toBeInstanceOf(ThreadDetails);
    expect(threadDetails.id).toEqual(payload.id);
    expect(threadDetails.title).toEqual(payload.title);
    expect(threadDetails.body).toEqual(payload.body);
    expect(threadDetails.date).toEqual(payload.date);
    expect(threadDetails.username).toEqual(payload.username);
    expect(threadDetails.comments).toEqual(payload.comments);
  });
});
