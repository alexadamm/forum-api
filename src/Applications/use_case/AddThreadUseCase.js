const CreateThread = require('../../Domains/threads/entities/CreateThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, owner) {
    const createThread = new CreateThread({ ...useCasePayload, owner });
    return this._threadRepository.addThread(createThread);
  }
}

module.exports = AddThreadUseCase;
