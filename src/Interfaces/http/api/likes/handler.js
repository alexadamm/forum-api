const AddDeleteLikeUseCase = require('../../../../Applications/use_case/AddDeleteLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request) {
    const addDeleteLikeUseCase = this._container.getInstance(AddDeleteLikeUseCase.name);
    await addDeleteLikeUseCase.execute(request.params, request.auth.credentials.id);

    return {
      status: 'success',
    };
  }
}

module.exports = LikesHandler;
