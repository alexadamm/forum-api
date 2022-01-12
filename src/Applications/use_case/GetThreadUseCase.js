/* eslint-disable no-param-reassign */
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

    const reformattedComments = this._reformatDeletedComments(comments);
    const reformattedReplies = this._reformatDeletedReplies(replies);
    const repliedComments = this._putRepliesToComments(reformattedReplies, reformattedComments);
    const likedComments = await this._putLikeCountToComments(repliedComments);

    thread.comments = likedComments;
    return thread;
  }

  _reformatDeletedComments(comments) {
    return comments.map((comment) => {
      comment.content = comment.isDeleted ? '**komentar telah dihapus**' : comment.content;
      delete comment.isDeleted;
      return comment;
    });
  }

  _reformatDeletedReplies(replies) {
    return replies.map((reply) => {
      reply.content = reply.isDeleted ? '**balasan telah dihapus**' : reply.content;
      delete reply.isDeleted;
      return reply;
    });
  }

  _putRepliesToComments(replies, comments) {
    return comments.map((comment) => {
      comment.replies = replies
        .filter(((reply) => reply.commentId === comment.id))
        .map((reply) => {
          delete reply.commentId;
          return reply;
        });
      return comment;
    });
  }

  async _putLikeCountToComments(comments) {
    return Promise.all(comments.map(async (comment) => {
      const likes = await this._likeRepository.getLikesByCommentId(comment.id);
      comment.likeCount = likes.length;
      return comment;
    }));
  }
}

module.exports = GetThreadUseCase;
