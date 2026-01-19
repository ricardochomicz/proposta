import type { CreateProposalInput, Proposal, ProposalItemDetail } from './types'

const API_BASE_URL = 'http://localhost:3001'

export async function listProposals(): Promise<Proposal[]> {
  const response = await fetch(`${API_BASE_URL}/proposals`)

  if (!response.ok) {
    throw new Error('Falha ao buscar propostas')
  }

  const data: Proposal[] = await response.json()
  return data
}

export async function updateProposal(
  id: number,
  input: CreateProposalInput
): Promise<Proposal> {
  const response = await fetch(`${API_BASE_URL}/proposals/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error || 'Erro ao atualizar proposta')
  }

  return data as Proposal
}

export async function deleteProposal(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/proposals/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Falha ao excluir proposta')
  }
}

export async function createProposal(
  input: CreateProposalInput
): Promise<Proposal> {
  const response = await fetch(`${API_BASE_URL}/proposals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error || 'Erro ao criar proposta')
  }

  return data as Proposal
}

export async function listProposalItems(
  proposalId: number
): Promise<ProposalItemDetail[]> {
  const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}/items`)

  if (!response.ok) {
    throw new Error('Falha ao buscar itens da proposta')
  }

  const data: ProposalItemDetail[] = await response.json()
  return data
}
