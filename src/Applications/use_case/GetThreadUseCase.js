/* eslint-disable no-param-reassign */
class GetThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParams) {
    const { threadId } = useCaseParams;
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    thread.comments = this._reformatDeletedComments(comments);
    return thread;
  }

  _reformatDeletedComments(comments) {
    return comments.map((comment) => {
      comment.content = comment.isDeleted ? '**komentar telah dihapus**' : comment.content;
      delete comment.isDeleted;
      return comment;
    });
  }
}

module.exports = GetThreadUseCase;
