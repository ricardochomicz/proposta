import api from '../services/api'
import type { CreateProposalInput, Proposal, ProposalItemDetail } from './types'

export async function listProposals(): Promise<Proposal[]> {
  const response = await api.get('/proposals')
  return response.data
}

export async function updateProposal(
  id: number,
  input: CreateProposalInput,
): Promise<Proposal> {
  const response = await api.put(`/proposals/${id}`, input)
  return response.data
}

export async function deleteProposal(id: number): Promise<void> {
  await api.delete(`/proposals/${id}`)
}

export async function createProposal(
  input: CreateProposalInput,
): Promise<Proposal> {
  const response = await api.post('/proposals', input)
  return response.data
}

export async function listProposalItems(
  proposalId: number,
): Promise<ProposalItemDetail[]> {
  const response = await api.get(`/proposals/${proposalId}/items`)
  return response.data
}
