import api from '../services/api'
import type { CreateUserInput, User } from './types'

export async function listUsers(): Promise<User[]> {
  const response = await api.get('/users')
  return response.data
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const response = await api.post('/users', input)
  return response.data
}

export async function updateUser(
  id: number,
  input: Partial<CreateUserInput>,
): Promise<User> {
  const response = await api.put(`/users/${id}`, input)
  return response.data
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`)
}
