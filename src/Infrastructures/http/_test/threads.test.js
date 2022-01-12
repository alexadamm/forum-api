const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const createServer = require('../createServer');
const container = require('../../container');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('/threads endpoint', () => {
  beforeAll(() => jest.setTimeout(50000));

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'Sebuah Utas',
        body: 'lorem ipsum',
      };

      const server = await createServer(container);

      const { accessToken } = await ServerTestHelper.newUser(server, {});

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Sebuah Utas',
      };

      const server = await createServer(container);

      const { accessToken } = await ServerTestHelper.newUser(server, {});

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'Sebuah Utas',
        body: ['lorem ipsum'],
      };

      const server = await createServer(container);

      const { accessToken } = await ServerTestHelper.newUser(server, {});

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 401 when auth token not provided', async () => {
      // Arrange
      const requestPayload = {
        title: 'Sebuah Utas',
        body: 'lorem ipsum',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and persisted thread', async () => {
      // Arrange
      const threadId = 'thread-123';

      const server = await createServer(container);

      const { userId: user0 } = await ServerTestHelper.newUser(server, {});
      const { userId: user1 } = await ServerTestHelper.newUser(server, { username: 'johndoe', fullName: 'John Doe' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: user0 });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId, owner: user0 });
      await CommentsTableTestHelper.addComment({ id: 'comment-124', threadId, owner: user1 });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: user0 });
      await RepliesTableTestHelper.addReply({ id: 'reply-124', commentId: 'comment-124', owner: user1 });
      await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-124', userId: user0 });
      await LikesTableTestHelper.addLike({ id: 'like-124', commentId: 'comment-124', userId: user1 });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(1);
      expect(responseJson.data.thread.comments[1].replies).toHaveLength(1);
      expect(responseJson.data.thread.comments[1].likeCount).toEqual(2);
    });

    it('should response 404 when thread is not found', async () => {
      // Arrange
      const threadId = 'thread-123';

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan!');
    });
  });
});
