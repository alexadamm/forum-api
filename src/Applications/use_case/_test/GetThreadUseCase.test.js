const GetThreadUseCase = require('../GetThreadUseCase');
const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentDetails = require('../../../Domains/comments/entities/CommentDetails');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyDetails = require('../../../Domains/replies/entities/ReplyDetails');

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

      /** creating dependency of use case */
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();

      /** mocking needed function */
      mockThreadRepository.getThreadById = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedThreadDetails));
      mockCommentRepository.getCommentsByThreadId = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedComments));

      /** creating use case instance */
      const getThreadUseCase = new GetThreadUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
      });

      /** spy needed function */
      const SpyReformatDeletedComments = jest.spyOn(getThreadUseCase, '_reformatDeletedComments');

      // Action
      const threadDetails = await getThreadUseCase.execute(useCaseParams);

      // Assert
      expect(threadDetails).toStrictEqual(new ThreadDetails({
        ...expectedThreadDetails, comments: expectedComments,
      }));
      expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParams.threadId);
      expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCaseParams.threadId);
      expect(SpyReformatDeletedComments).toHaveBeenCalledWith(expectedComments);
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
});
