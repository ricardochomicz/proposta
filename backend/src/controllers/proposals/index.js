import { Router } from 'express'
import proposalController from './ProposalController.js'

const router = Router()

router.get('/', proposalController.index)
router.get('/:id/items', proposalController.getItems)
router.post('/', proposalController.create)
router.put('/:id', proposalController.update)
router.delete('/:id', proposalController.delete)

export default router
