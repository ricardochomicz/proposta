import type { CreateUserInput, User } from './types'

const API_BASE_URL = 'http://localhost:3001'

export async function listUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/users`)

  if (!response.ok) {
    throw new Error('Falha ao buscar usuários')
  }

  const data: User[] = await response.json()
  return data
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error || 'Erro ao criar usuário')
  }

  return data as User
}

export async function updateUser(
  id: number,
  input: Partial<CreateUserInput>
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error || 'Erro ao atualizar usuário')
  }

  return data as User
}

export async function deleteUser(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.error || 'Erro ao excluir usuário')
  }
}

