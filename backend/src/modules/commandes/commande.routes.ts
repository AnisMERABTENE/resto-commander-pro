import { Router } from 'express'
import * as commandeCtrl from './commande.controller'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'

const router = Router()

router.post('/', authMiddleware, commandeCtrl.createCommande)
router.put('/:id/statut', authMiddleware, commandeCtrl.updateStatut)


export default router
