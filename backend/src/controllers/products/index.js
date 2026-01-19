import { Router } from 'express'
import productController from './ProductController.js'

const router = Router()

router.get('/', productController.index)
router.post('/', productController.create)
router.put('/:id', productController.update)
router.delete('/:id', productController.delete)

export default router
