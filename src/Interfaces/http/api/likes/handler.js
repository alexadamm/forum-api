const AddDeleteLikeUseCase = require('../../../../Applications/use_case/AddDeleteLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request, h) {
    const addDeleteLikeUseCase = this._container.getInstance(AddDeleteLikeUseCase.name);
    await addDeleteLikeUseCase.execute(request.params, request.auth.credentials.id);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;
