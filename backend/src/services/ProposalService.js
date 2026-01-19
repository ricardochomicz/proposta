import proposalRepository from '../repositories/ProposalRepository.js'
import AppError from '../utils/AppError.js'

class ProposalService {
  async findAll() {
    return await proposalRepository.findAll()
  }

  async findItemsByProposalId(id) {
    return await proposalRepository.findItemsByProposalId(id)
  }

  async create(proposalData) {
    const { userId, total, document, name, items } = proposalData

    if (!userId || total == null || !document || !name) {
      throw new AppError('Usuário, documento e nome são obrigatórios')
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError('Adicione pelo menos um item à proposta')
    }

    return await proposalRepository.create(proposalData)
  }

  async update(id, proposalData) {
    const { userId, total, document, name, items } = proposalData

    if (!userId || total == null || !document || !name) {
      throw new AppError('Usuário, documento e nome são obrigatórios')
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError('Adicione pelo menos um item à proposta')
    }

    return await proposalRepository.update(id, proposalData)
  }

  async delete(id) {
    return await proposalRepository.delete(id)
  }
}

const proposalService = new ProposalService()
export default proposalService
