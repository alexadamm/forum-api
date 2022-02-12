const LikeAct = require('../../Domains/likes/entities/LikeAct');

class AddDeleteLikeUseCase {
  constructor({ likeRepository, commentRepository }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParams, userId) {
    const { commentId } = useCaseParams;
    await this._commentRepository.verifyCommentExistence(useCaseParams);
    const likeExistence = await this._likeRepository.verifyLikeExistence({ commentId, userId });
    const likeAct = new LikeAct({ userId, commentId });

    if (likeExistence) {
      await this._likeRepository.deleteLikeByCommentIdAndUserId(likeAct);
    } else {
      await this._likeRepository.addLike(likeAct);
    }
  }
}

module.exports = AddDeleteLikeUseCase;
