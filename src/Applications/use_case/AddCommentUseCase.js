const CreateComment = require('../../Domains/comments/entities/CreateComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCaseParams, useCasePayload, owner) {
    const { threadId } = useCaseParams;
    await this._threadRepository.getThreadById(threadId);
    const createComment = new CreateComment({ ...useCasePayload, threadId, owner });
    return this._commentRepository.addComment(createComment);
  }
}

module.exports = AddCommentUseCase;
