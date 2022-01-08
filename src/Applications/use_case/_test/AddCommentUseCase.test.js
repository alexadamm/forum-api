const AddCommentUseCase = require('../AddCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CreatedComment = require('../../../Domains/comments/entities/CreatedComment');
const CreateComment = require('../../../Domains/comments/entities/CreateComment');

describe('AddCommentUseCase', () => {
  /**
  * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
  */
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const userId = 'user-123';
    const useCaseParams = {
      threadId: 'thread-123',
    };
    const useCasePayload = {
      content: 'lorem ipsum',
    };
    const expectedCreatedComment = new CreatedComment({
      id: 'comment-123',
      content: 'lorem ipsum',
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedCreatedComment));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdComment = await addCommentUseCase.execute(useCaseParams, useCasePayload, userId);

    // Assert
    expect(createdComment).toStrictEqual(expectedCreatedComment);
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.addComment).toBeCalledWith(new CreateComment({
      ...useCaseParams,
      ...useCasePayload,
      owner: userId,
    }));
  });
});
