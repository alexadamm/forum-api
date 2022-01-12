const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const pool = require('../../database/postgres/pool');
const LikeAct = require('../../../Domains/likes/entities/LikeAct');

describe('LikeRepositoryPostgres', () => {
  beforeEach(async () => {
    const userId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
    await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist create like', async () => {
      // Arrange
      const likeAct = new LikeAct({
        commentId: 'comment-123',
        userId: 'user-123',
      });
      const fakeIdGenerator = () => '123';

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike(likeAct);

      // Assert
      const likes = await LikesTableTestHelper
        .findLikesByCommentIdAndUserId({
          commentId: likeAct.commentId,
          userId: likeAct.owner,
        });
      expect(likes).toHaveLength(1);
    });
  });

  describe('verifyLikeExistance function', () => {
    it('should return false when like doesn\'t exist', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action and Assert
      expect(await likeRepositoryPostgres.verifyLikeExistance({
        commentId: 'comment-123',
        userId: 'user-123',
      })).toEqual(false);
    });

    it('should return true when like exists', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});
      await LikesTableTestHelper.addLike({
        commentId: 'comment-123',
        userId: 'user-123',
      });

      // Action and Assert
      expect(await likeRepositoryPostgres.verifyLikeExistance({
        commentId: 'comment-123',
        userId: 'user-123',
      })).toEqual(true);
    });
  });

  describe('getLikesByCommentId', () => {
    it('should return like count of comment correctly', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        userId: 'user-123',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-124',
        username: 'johndoe',
      });
      await LikesTableTestHelper.addLike({
        id: 'like-124',
        userId: 'user-124',
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});
      // Action
      const likes = await likeRepositoryPostgres
        .getLikesByCommentId('comment-123');

      // Assert
      expect(likes).toHaveLength(2);
      expect(likes[0].username).toEqual('dicoding');
      expect(likes[1].username).toEqual('johndoe');
    });
  });

  describe('deleteLikeByCommentIdAndUserId function', () => {
    it('should delete like correctly', async () => {
      // Arrange
      const commentId = 'comment-123';
      const userId = 'user-123';
      await LikesTableTestHelper.addLike({
        commentId, userId,
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {}, {});

      // Action
      await likeRepositoryPostgres.deleteLikeByCommentIdAndUserId({
        commentId, userId,
      });

      // Assert
      const like = await LikesTableTestHelper.findLikesByCommentIdAndUserId({
        commentId, userId,
      });
      expect(like).toHaveLength(0);
    });
  });
});
