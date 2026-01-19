import proposalService from '../../services/ProposalService.js'

class ProposalController {
  async index(req, res) {
    const proposals = await proposalService.findAll()
    res.json(proposals)
  }

  async getItems(req, res) {
    const { id } = req.params
    const items = await proposalService.findItemsByProposalId(id)
    res.json(items)
  }

  async create(req, res) {
    const newProposal = await proposalService.create(req.body)
    res.status(201).json(newProposal)
  }

  async update(req, res) {
    const { id } = req.params

    const updatedProposal = await proposalService.update(id, req.body)
    if (!updatedProposal) {
      res.status(404).json({ error: 'Proposta não encontrada' })
      return
    }
    res.json(updatedProposal)
  }

  async delete(req, res) {
    const { id } = req.params

    const deleted = await proposalService.delete(id)
    if (!deleted) {
      res.status(404).json({ error: 'Proposta não encontrada' })
      return
    }
    res.status(204).send()
  }
}

const proposalController = new ProposalController()
export default proposalController
