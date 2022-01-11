const AddReplyUseCase = require('../AddReplyUseCase');
const CreatedReply = require('../../../Domains/replies/entities/CreatedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CreateReply = require('../../../Domains/replies/entities/CreateReply');

describe('AddReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const userId = 'user-123';
    const useCaseParams = {
      commentId: 'comment-123',
      threadId: 'thread-123',
    };
    const useCasePayload = {
      content: 'lorem ipsum dolor sit amet',
    };
    const expectedCreatedReply = new CreatedReply({
      id: 'reply-123',
      content: 'lorem ipsum dolor sit amet',
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed functions */
    mockCommentRepository.verifyCommentExistance = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedCreatedReply));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const createdReply = await addReplyUseCase.execute(useCaseParams, useCasePayload, userId);

    // Assert
    expect(createdReply).toStrictEqual(expectedCreatedReply);
    expect(mockCommentRepository.verifyCommentExistance).toBeCalledWith(useCaseParams);
    expect(mockReplyRepository.addReply).toBeCalledWith(new CreateReply({
      ...useCaseParams,
      ...useCasePayload,
      owner: userId,
    }));
  });
});
