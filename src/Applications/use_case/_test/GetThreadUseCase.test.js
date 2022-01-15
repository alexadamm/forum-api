const GetThreadUseCase = require('../GetThreadUseCase');
const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentDetails = require('../../../Domains/comments/entities/CommentDetails');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyDetails = require('../../../Domains/replies/entities/ReplyDetails');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');

describe('GetThreadUseCase', () => {
  describe('execute function', () => {
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
      const expectedComments = [
        new CommentDetails({
          id: 'comment-123',
          username: 'dicoding',
          date: '2021',
          content: 'first comment',
          replies: [],
          likeCount: 0,
          isDeleted: false,
        }),
        new CommentDetails({
          id: 'comment-124',
          username: 'johndoe',
          date: '2022',
          content: 'second comment',
          replies: [],
          likeCount: 0,
          isDeleted: false,
        }),
        new CommentDetails({
          id: 'comment-125',
          username: 'dicoding',
          date: '2022',
          content: 'third comment',
          replies: [],
          likeCount: 0,
          isDeleted: true,
        }),
      ];
      const expectedReplies = [
        new ReplyDetails({
          id: 'reply-123',
          commentId: 'comment-123',
          content: 'first reply',
          date: '2021',
          username: 'dicoding',
          isDeleted: true,
        }),
        new ReplyDetails({
          id: 'reply-124',
          commentId: 'comment-124',
          content: 'first reply',
          date: '2022',
          username: 'johndoe',
          isDeleted: false,
        }),
        new ReplyDetails({
          id: 'reply-125',
          commentId: 'comment-124',
          content: 'second reply',
          date: '2022',
          username: 'dicoding',
          isDeleted: true,
        }),
      ];
      const expectedThread = {
        ...expectedThreadDetails,
        comments: [
          {
            id: 'comment-123',
            username: 'dicoding',
            date: '2021',
            content: 'first comment',
            replies: [
              {
                id: 'reply-123',
                content: '**balasan telah dihapus**',
                date: '2021',
                username: 'dicoding',
              },
            ],
            likeCount: 4,
          },
          {
            id: 'comment-124',
            username: 'johndoe',
            date: '2022',
            content: 'second comment',
            replies: [
              {
                id: 'reply-124',
                content: 'first reply',
                date: '2022',
                username: 'johndoe',
              },
              {
                id: 'reply-125',
                content: '**balasan telah dihapus**',
                date: '2022',
                username: 'dicoding',
              },
            ],
            likeCount: 0,
          },
          {
            id: 'comment-125',
            username: 'dicoding',
            date: '2022',
            content: '**komentar telah dihapus**',
            replies: [],
            likeCount: 0,
          },
        ],
      };

      /** creating dependency of use case */
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockReplyRepository = new ReplyRepository();
      const mockLikeRepository = new LikeRepository();

      /** mocking needed function */
      mockThreadRepository.getThreadById = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedThreadDetails));
      mockCommentRepository.getCommentsByThreadId = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedComments));
      mockReplyRepository.getRepliesByThreadId = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedReplies));
      mockLikeRepository.getLikesByCommentId = jest.fn()
        .mockImplementation((commentId) => Promise.resolve(commentId === 'comment-123' ? [
          { username: 'dicoding' },
          { username: 'johndoe' },
          { username: 'richard' },
          { username: 'robert' },
        ] : []));

      /** creating use case instance */
      const getThreadUseCase = new GetThreadUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
        likeRepository: mockLikeRepository,
      });

      /** spy needed private function */
      const SpyReformatDeletedComments = jest.spyOn(getThreadUseCase, '_reformatDeletedComments');
      const SpyReformatDeletedReplies = jest.spyOn(getThreadUseCase, '_reformatDeletedReplies');
      const SpyPutRepliesToComments = jest.spyOn(getThreadUseCase, '_putRepliesToComments');
      const SpyPutLikeCountToComments = jest.spyOn(getThreadUseCase, '_putLikeCountToComments');

      // Action
      const threadDetails = await getThreadUseCase.execute(useCaseParams);

      // Assert
      expect(threadDetails).toEqual(expectedThread);
      expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParams.threadId);
      expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCaseParams.threadId);
      expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCaseParams.threadId);
      expect(mockLikeRepository.getLikesByCommentId).toBeCalledTimes(3);
      expect(SpyReformatDeletedComments).toHaveBeenCalledWith(expectedComments);
      expect(SpyReformatDeletedReplies).toHaveBeenCalledWith(expectedReplies);
      expect(SpyPutRepliesToComments).toHaveBeenCalled();
      expect(SpyPutLikeCountToComments).toHaveBeenCalled();
    });
  });
});
