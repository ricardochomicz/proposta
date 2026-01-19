import productRepository from '../repositories/ProductRepository.js'
import AppError from '../utils/AppError.js'

class ProductService {
  async findAll() {
    return await productRepository.findAll()
  }

  async create(productData) {
    const { operator, description, price } = productData
    if (!operator || !description || price == null) {
      throw new AppError('Operador, descrição e preço são obrigatórios')
    }
    return await productRepository.create(productData)
  }

  async update(id, productData) {
    const { operator, description, price } = productData
    if (!operator || !description || price == null) {
      throw new AppError('Operador, descrição e preço são obrigatórios')
    }
    return await productRepository.update(id, productData)
  }

  async delete(id) {
    return await productRepository.delete(id)
  }
}

const productService = new ProductService()
export default productService
