class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParams, userId) {
    const { replyId } = useCaseParams;

    await this._replyRepository.verifyReplyExistance(useCaseParams);
    await this._replyRepository.verifyReplyAccessibility({ replyId, userId });
    await this._replyRepository.deleteReplyById(replyId);
  }
}

module.exports = DeleteReplyUseCase;
