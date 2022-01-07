const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist create thread', async () => {
      // Arrange
      const createThread = new CreateThread({
        title: 'Sebuah Utas',
        body: 'lorem ipsum',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(createThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('return created thread correctly', async () => {
      // Arrange
      const createThread = new CreateThread({
        title: 'Sebuah Utas',
        body: 'lorem ipsum',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdThread = await threadRepositoryPostgres.addThread(createThread);

      // Assert
      expect(createdThread).toStrictEqual(new CreatedThread({
        id: 'thread-123',
        title: 'Sebuah Utas',
        owner: 'user-123',
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should return NotFoundError if thread is not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});
      const threadId = 'thread-xxx';

      // Action & Assert
      expect(threadRepositoryPostgres.getThreadById(threadId))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return threadDetails correctly', async () => {
      // Arrange
      const expectedThreadDetails = new ThreadDetails({
        id: 'thread-123',
        title: 'thread-123',
        body: 'Sebuah Utas',
        date: '2022',
        username: 'dicoding',
        comments: [],
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: 'thread-123',
        body: 'Sebuah Utas',
        owner: 'user-123',
      });

      // Action
      const threadDetails = await threadRepositoryPostgres.getThreadById(threadId);

      // Arrange
      expect(threadDetails.id).toEqual(expectedThreadDetails.id);
      expect(threadDetails.title).toEqual(expectedThreadDetails.title);
      expect(threadDetails.body).toEqual(expectedThreadDetails.body);
      expect(threadDetails.username).toEqual(expectedThreadDetails.username);
      expect(threadDetails.comments).toEqual(expectedThreadDetails.comments);
      expect(threadDetails.date).toBeDefined();
    });
  });
});
