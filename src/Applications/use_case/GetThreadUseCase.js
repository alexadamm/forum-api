class GetThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCaseParams) {
    const { threadId } = useCaseParams;
    return this._threadRepository.getThreadById(threadId);
  }
}

module.exports = GetThreadUseCase;
