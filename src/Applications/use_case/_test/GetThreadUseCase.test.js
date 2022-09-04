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

      /** spy needed function */
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
      expect(SpyReformatDeletedComments).toHaveBeenCalledWith(expectedComments);
      expect(SpyReformatDeletedReplies).toHaveBeenCalledWith(expectedReplies);
      expect(SpyPutRepliesToComments).toHaveBeenCalled();
      expect(SpyPutLikeCountToComments).toHaveBeenCalled();
    });
  });

  describe('_reformatDeletedComments function', () => {
    it('should reformat deleted comments correctly', () => {
      // Arrange
      const comments = [
        new CommentDetails({
          id: 'comment-123',
          username: 'dicoding',
          date: '2021',
          content: 'first comment',
          replies: [],
          likeCount: 0,
          isDeleted: true,
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
          username: 'johndoe',
          date: '2022',
          content: 'third comment',
          replies: [],
          likeCount: 0,
          isDeleted: true,
        }),
      ];

      const filteredComments = comments.map((comment) => {
        const { isDeleted, ...filteredComment } = comment;
        return filteredComment;
      });

      /** creating use case instance */
      const getThreadUseCase = new GetThreadUseCase({
        threadRepository: {},
        commentRepository: {},
        replyRepository: {},
        likeRepository: {},
      });

      // Action
      const reformattedComments = getThreadUseCase._reformatDeletedComments(comments);

      // Assert
      expect(reformattedComments).toEqual([
        {
          ...filteredComments[0], content: '**komentar telah dihapus**',
        },
        filteredComments[1],
        {
          ...filteredComments[2], content: '**komentar telah dihapus**',
        },
      ]);
    });
  });

  describe('_reformatDeletedReplies functions', () => {
    it('should reformat deleted replies correctly', () => {
      // Arrange
      const replies = [
        new ReplyDetails({
          id: 'reply-123',
          commentId: 'comment-123',
          content: 'first reply',
          date: '2020',
          username: 'dicoding',
          isDeleted: true,
        }),
        new ReplyDetails({
          id: 'reply-124',
          commentId: 'comment-124',
          content: 'first reply',
          date: '2020',
          username: 'johndoe',
          isDeleted: false,
        }),
        new ReplyDetails({
          id: 'reply-125',
          commentId: 'comment-124',
          content: 'second reply',
          date: '2021',
          username: 'dicoding',
          isDeleted: true,
        }),
      ];

      const filteredReplies = replies.map((reply) => {
        const { isDeleted, ...filteredReply } = reply;
        return filteredReply;
      });

      /** creating use case instance */
      const getThreadUseCase = new GetThreadUseCase({
        threadRepository: {},
        commentRepository: {},
        replyRepository: {},
        likeRepository: {},
      });

      // Action
      const reformattedReplies = getThreadUseCase._reformatDeletedReplies(replies);

      // Assert
      expect(reformattedReplies).toEqual([
        { ...filteredReplies[0], content: '**balasan telah dihapus**' },
        filteredReplies[1],
        { ...filteredReplies[2], content: '**balasan telah dihapus**' },
      ]);
    });
  });

  describe('_putRepliesToComments function', () => {
    it('should return comments with their replies', () => {
      // Arrange
      const formattedComments = [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2021',
          content: '**komentar telah dihapus**',
          replies: [],
          likeCount: 0,
        },
        {
          id: 'comment-124',
          username: 'johndoe',
          date: '2022',
          content: 'second comment',
          replies: [],
          likeCount: 0,
        },
        {
          id: 'comment-125',
          username: 'johndoe',
          date: '2022',
          content: '**komentar telah dihapus**',
          replies: [],
          likeCount: 0,
        },
      ];
      const formattedReplies = [
        {
          id: 'reply-123',
          commentId: 'comment-123',
          content: '**balasan telah dihapus**',
          date: '2021',
          username: 'dicoding',
        },
        {
          id: 'reply-124',
          commentId: 'comment-124',
          content: 'first reply',
          date: '2022',
          username: 'johndoe',
        },
        {
          id: 'reply-125',
          commentId: 'comment-124',
          content: '**balasan telah dihapus**',
          date: '2022',
          username: 'dicoding',
        },
      ];
      const expectedComments = [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2021',
          content: '**komentar telah dihapus**',
          replies: [
            {
              id: 'reply-123',
              content: '**balasan telah dihapus**',
              date: '2021',
              username: 'dicoding',
            },
          ],
          likeCount: 0,
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
          username: 'johndoe',
          date: '2022',
          content: '**komentar telah dihapus**',
          replies: [],
          likeCount: 0,
        },
      ];

      /** creating use case instance */
      const getThreadUseCase = new GetThreadUseCase({
        threadRepository: {},
        commentRepository: {},
        replyRepository: {},
        likeRepository: {},
      });

      // Action
      const repliedComments = getThreadUseCase
        ._putRepliesToComments(formattedReplies, formattedComments);

      // Assert
      expect(repliedComments).toEqual(expectedComments);
    });
  });

  describe('_putLikeCountToComments', () => {
    it('should return comments with their number of likes', async () => {
      // Arrange
      const formattedComments = [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2021',
          content: '**komentar telah dihapus**',
          replies: [],
          likeCount: 0,
        },
        {
          id: 'comment-124',
          username: 'johndoe',
          date: '2022',
          content: 'second comment',
          replies: [],
          likeCount: 0,
        },
        {
          id: 'comment-125',
          username: 'johndoe',
          date: '2022',
          content: '**komentar telah dihapus**',
          replies: [],
          likeCount: 0,
        },
      ];
      const expectedLikedComments = [
        {
          ...formattedComments[0], likeCount: 3,
        },
        {
          ...formattedComments[1], likeCount: 0,
        },
        {
          ...formattedComments[2], likeCount: 5,
        },
      ];

      /** creating dependency of use case */
      const mockLikeRepository = new LikeRepository();

      /** mocking needed functions */
      mockLikeRepository.getLikesByCommentId = jest.fn()
        .mockImplementation((commentId) => {
          switch (commentId) {
            case 'comment-123':
              return Promise.resolve([
                { username: 'dicoding' },
                { username: 'johndoe' },
                { username: 'richard' },
              ]);
            case 'comment-125':
              return Promise.resolve([
                { username: 'dicoding' },
                { username: 'johndoe' },
                { username: 'foo' },
                { username: 'richard' },
                { username: 'barney' },
              ]);
            default:
              return Promise.resolve([]);
          }
        });

      /** creating use case instance */
      const getThreadUseCase = new GetThreadUseCase({
        threadRepository: {},
        commentRepository: {},
        replyRepository: {},
        likeRepository: mockLikeRepository,
      });

      // Action
      const likedComments = await getThreadUseCase._putLikeCountToComments(formattedComments);

      // Assert
      expect(likedComments).toStrictEqual(expectedLikedComments);
      expect(mockLikeRepository.getLikesByCommentId).toBeCalledTimes(3);
    });
  });
});
