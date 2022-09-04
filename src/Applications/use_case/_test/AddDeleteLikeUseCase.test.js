const LikesRepository = require('../../../Domains/likes/LikeRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddDeleteLikeUseCase = require('../AddDeleteLikeUseCase');

describe('AddDeleteLikeUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add like action correctly when like doesn\'t exist', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const userId = 'user-123';

    /** creating dependency of use case */
    const mockLikeRepository = new LikesRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.verifyCommentExistance = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLikeExistance = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addDeleteLikeUseCase = new AddDeleteLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await addDeleteLikeUseCase.execute(useCaseParams, userId);

    // Assert
    expect(mockCommentRepository.verifyCommentExistance).toBeCalledWith(useCaseParams);
    expect(mockLikeRepository.verifyLikeExistance).toBeCalledWith({
      commentId: useCaseParams.commentId, userId,
    });
    expect(mockLikeRepository.addLike).toBeCalledWith({
      commentId: useCaseParams.commentId, userId,
    });
  });

  it('should orchestrating the delete like action correctly when like exists', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const userId = 'user-123';

    /** creating dependency of use case */
    const mockLikeRepository = new LikesRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.verifyCommentExistance = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLikeExistance = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.deleteLikeByCommentIdAndUserId = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addDeleteLikeUseCase = new AddDeleteLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await addDeleteLikeUseCase.execute(useCaseParams, userId);

    // Assert
    expect(mockCommentRepository.verifyCommentExistance).toBeCalledWith(useCaseParams);
    expect(mockLikeRepository.verifyLikeExistance).toBeCalledWith({
      commentId: useCaseParams.commentId, userId,
    });
    expect(mockLikeRepository.deleteLikeByCommentIdAndUserId).toBeCalledWith({
      commentId: useCaseParams.commentId, userId,
    });
  });
});
