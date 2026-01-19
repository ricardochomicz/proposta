import { Router } from 'express'
import userController from './UserController.js'

const router = Router()

router.get('/', userController.index)
router.post('/', userController.create)
router.put('/:id', userController.update)

export default router
