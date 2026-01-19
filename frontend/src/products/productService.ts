import api from '../services/api'
import type { CreateProductInput, Product } from './types'

export async function listProducts(): Promise<Product[]> {
  const response = await api.get('/products')
  return response.data
}

export async function createProduct(
  input: CreateProductInput,
): Promise<Product> {
  const response = await api.post('/products', input)
  return response.data
}

export async function updateProduct(
  id: number,
  input: Partial<CreateProductInput>,
): Promise<Product> {
  const response = await api.put(`/products/${id}`, input)
  return response.data
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`)
}
