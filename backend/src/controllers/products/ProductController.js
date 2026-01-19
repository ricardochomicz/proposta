import productService from '../../services/ProductService.js'

class ProductController {
  async index(req, res) {
    const products = await productService.findAll()
    res.json(products)
  }

  async create(req, res) {
    const newProduct = await productService.create(req.body)
    res.status(201).json(newProduct)
  }

  async update(req, res) {
    const { id } = req.params

    const updatedProduct = await productService.update(id, req.body)
    if (!updatedProduct) {
      res.status(404).json({ error: 'Produto não encontrado' })
      return
    }
    res.json(updatedProduct)
  }

  async delete(req, res) {
    const { id } = req.params

    const deleted = await productService.delete(id)
    if (!deleted) {
      res.status(404).json({ error: 'Produto não encontrado' })
      return
    }
    res.status(204).send()
  }
}

const productController = new ProductController()
export default productController
