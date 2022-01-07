const GetThreadUseCase = require('../GetThreadUseCase');
const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('GetThreadUseCase', () => {
  /**
  * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
  */
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
    };
    const expectedThreadDetails = new ThreadDetails({
      id: 'thread-123',
      title: 'Sebuah Utas',
      body: 'lorem ipsum',
      date: '2021',
      username: 'dicoding',
      comments: [],
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThreadDetails));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const threadDetails = await getThreadUseCase.execute(useCaseParams);

    // Assert
    expect(threadDetails).toStrictEqual(expectedThreadDetails);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParams.threadId);
  });
});
