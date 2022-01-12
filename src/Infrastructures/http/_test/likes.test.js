const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  beforeAll(() => jest.setTimeout(50000));

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should return 200 when giving like', async () => {
      // Arrange
      const expectedThreadId = 'thread-123';
      const expectedCommentId = 'comment-123';

      const server = await createServer(container);

      const { accessToken, userId } = await ServerTestHelper.newUser(server, {});

      await ThreadsTableTestHelper.addThread({
        id: expectedThreadId, owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: expectedCommentId, owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${expectedThreadId}/comments/${expectedCommentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should return 200 when ungiving like', async () => {
      // Arrange
      const expectedThreadId = 'thread-123';
      const expectedCommentId = 'comment-123';
      const expectedLikeId = 'like-123';

      const server = await createServer(container);

      const { accessToken, userId } = await ServerTestHelper.newUser(server, {});

      await ThreadsTableTestHelper.addThread({
        id: expectedThreadId, owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: expectedCommentId, owner: userId,
      });
      await LikesTableTestHelper.addLike({
        id: expectedLikeId, userId,
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${expectedThreadId}/comments/${expectedCommentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should return 401 when no auth token is provided', async () => {
      // Arrange
      const expectedThreadId = 'thread-123';
      const expectedCommentId = 'comment-123';

      const server = await createServer(container);

      const { userId } = await ServerTestHelper.newUser(server, {});

      await ThreadsTableTestHelper.addThread({
        id: expectedThreadId, owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: expectedCommentId, owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${expectedThreadId}/comments/${expectedCommentId}/likes`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });
});
