import type { CreateProductInput, Product } from './types'

const API_BASE_URL = 'http://localhost:3001'

export async function listProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products`)

  if (!response.ok) {
    throw new Error('Falha ao buscar produtos')
  }

  const data: Product[] = await response.json()
  return data
}

export async function createProduct(
  input: CreateProductInput
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error || 'Erro ao criar produto')
  }

  return data as Product
}

export async function updateProduct(
  id: number,
  input: Partial<CreateProductInput>
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error || 'Erro ao atualizar produto')
  }

  return data as Product
}

export async function deleteProduct(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.error || 'Erro ao excluir produto')
  }
}
