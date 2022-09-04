const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const CreateComment = require('../../../Domains/comments/entities/CreateComment');
const CreatedComment = require('../../../Domains/comments/entities/CreatedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const CommentDetails = require('../../../Domains/comments/entities/CommentDetails');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist create comment', async () => {
      // Arrange
      const createComment = new CreateComment({
        threadId: 'thread-123',
        content: 'lorem ipsum dolor sit amet',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(createComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return comment correctly', async () => {
      // Arrange
      const createComment = new CreateComment({
        threadId: 'thread-123',
        content: 'lorem ipsum dolor sit amet',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdComment = await commentRepositoryPostgres.addComment(createComment);

      // Assert
      expect(createdComment).toStrictEqual(new CreatedComment({
        id: 'comment-123',
        content: 'lorem ipsum dolor sit amet',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyCommentExistance function', () => {
    it('should throw NotFoundError when comment does not exist', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentExistance({
        commentId: 'comment-123',
        threadId: 'thread-123',
      })).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when the comment exists', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentExistance({
        commentId: 'comment-123',
        threadId: 'thread-123',
      })).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentAccessibility function', () => {
    it('should throw AuthorizationError when user is not owner of the comment', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAccessibility({
        commentId: 'comment-123', userId: 'user-345',
      })).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when user is the owner of the comment', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAccessibility({
        commentId: 'comment-123', userId: 'user-123',
      })).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteCommentById function', () => {
    it('should delete the comment correctly', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });

      // Action
      await commentRepositoryPostgres.deleteCommentById('comment-123');

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments[0].is_deleted).toEqual(true);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return every comment that are in the thread as commentDetails correctly', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'first comment' });
      await CommentsTableTestHelper.addComment({ id: 'comment-124', content: 'second comment' });

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(2);
      expect(comments[0].date).toBeDefined();
      expect(comments[0]).toStrictEqual(new CommentDetails({
        id: 'comment-123', username: 'dicoding', date: comments[0].date, content: 'first comment', replies: [], likeCount: 0, isDeleted: false,
      }));
      expect(comments[1].date).toBeDefined();
      expect(comments[1]).toStrictEqual(new CommentDetails({
        id: 'comment-124', username: 'dicoding', date: comments[1].date, content: 'second comment', replies: [], likeCount: 0, isDeleted: false,
      }));
    });

    it('should return empty array when thread has no comments', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      expect(await commentRepositoryPostgres.getCommentsByThreadId('thread-123')).toEqual([]);
    });
  });
});
