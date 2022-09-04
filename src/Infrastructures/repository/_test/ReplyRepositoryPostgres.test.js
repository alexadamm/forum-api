const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const CreateReply = require('../../../Domains/replies/entities/CreateReply');
const CreatedReply = require('../../../Domains/replies/entities/CreatedReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const ReplyDetails = require('../../../Domains/replies/entities/ReplyDetails');

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply functiion', () => {
    it('should persist create reply', async () => {
      // Arrange
      const createReply = new CreateReply({
        commentId: 'comment-123',
        owner: 'user-123',
        content: 'lorem ipsum dolor sit amet',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(createReply);

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should return created reply correctly', async () => {
      // Arrange
      const createReply = new CreateReply({
        commentId: 'comment-123',
        owner: 'user-123',
        content: 'lorem ipsum dolor sit amet',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdReply = await replyRepositoryPostgres.addReply(createReply);

      // Assert
      expect(createdReply).toStrictEqual(new CreatedReply({
        id: 'reply-123',
        owner: 'user-123',
        content: 'lorem ipsum dolor sit amet',
      }));
    });
  });

  describe('verifyReplyExistance function', () => {
    it('should throw NotFoundError when reply does not exist', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyExistance({
        replyId: 'reply-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
      })).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply exists', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyExistance({
        replyId: 'reply-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
      })).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyAccessibility function', () => {
    it('should throw AuthorizationError when user is not owner of the reply', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123' });

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyAccessibility({
        replyId: 'reply-123', userId: 'user-345',
      })).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when user is the owner of the reply', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123' });

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyAccessibility({
        replyId: 'reply-123', userId: 'user-123',
      })).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReplyById function', () => {
    it('should delete the reply correctly', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123' });

      // Action
      await replyRepositoryPostgres.deleteReplyById('reply-123');

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies[0].is_deleted).toEqual(true);
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return every reply that are in the thread as replyDetails correctly', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await RepliesTableTestHelper.addReply({ id: 'reply-123', content: 'first reply' });
      await RepliesTableTestHelper.addReply({ id: 'reply-124', content: 'second reply' });

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0].date).toBeDefined();
      expect(replies[0]).toStrictEqual(new ReplyDetails({
        id: 'reply-123', commentId: 'comment-123', username: 'dicoding', date: replies[0].date, content: 'first reply', isDeleted: false,
      }));
      expect(replies[1].date).toBeDefined();
      expect(replies[1]).toStrictEqual(new ReplyDetails({
        id: 'reply-124', commentId: 'comment-123', username: 'dicoding', date: replies[1].date, content: 'second reply', isDeleted: false,
      }));
    });

    it('should return empty array when thread has no replied comments', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      expect(await replyRepositoryPostgres.getRepliesByThreadId('thread-123')).toEqual([]);
    });
  });
});
