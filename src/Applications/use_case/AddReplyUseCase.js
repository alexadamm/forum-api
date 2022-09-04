const CreateReply = require('../../Domains/replies/entities/CreateReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParams, useCasePayload, owner) {
    const { commentId } = useCaseParams;
    await this._commentRepository.verifyCommentExistance(useCaseParams);
    const createReply = new CreateReply({ ...useCasePayload, commentId, owner });
    return this._replyRepository.addReply(createReply);
  }
}

module.exports = AddReplyUseCase;
