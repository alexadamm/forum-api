/* eslint-disable max-classes-per-file */
/* eslint-disable no-param-reassign */
class Comment {
  constructor({
    id, content, date, isDeleted, replies, username, likeCount,
  }) {
    this.id = id;
    this.content = isDeleted ? '**komentar telah dihapus**' : content;
    this.date = date;
    this.replies = replies;
    this.username = username;
    this.likeCount = likeCount;
  }
}

class Reply {
  constructor({
    id, content, date, isDeleted, replies, username,
  }) {
    this.id = id;
    this.content = isDeleted ? '**balasan telah dihapus**' : content;
    this.date = date;
    this.replies = replies;
    this.username = username;
  }
}

class GetThreadUseCase {
  constructor(
    {
      threadRepository, commentRepository, replyRepository, likeRepository,
    },
  ) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCaseParams) {
    const { threadId } = useCaseParams;

    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);

    const formattedComments = comments.map((comment) => new Comment(comment));
    await Promise.all(formattedComments.map(async (comment) => {
      const likes = await this._likeRepository.getLikesByCommentId(comment.id);
      comment.likeCount = likes.length;
      comment.replies = replies.filter((reply) => reply.commentId === comment.id)
        .map((reply) => new Reply(reply));
      return comment;
    }));

    thread.comments = formattedComments;
    return thread;
  }
}

module.exports = GetThreadUseCase;
