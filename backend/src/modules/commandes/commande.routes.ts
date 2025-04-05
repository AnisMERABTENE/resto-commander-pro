import { Router } from 'express'
import * as commandeCtrl from './commande.controller'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { guardByRole } from '../../shared/middlewares/role.guard'
import { Role } from '@prisma/client'

const router = Router()

router.post('/', authMiddleware, commandeCtrl.createCommande)
router.put('/:id/statut', authMiddleware, [
  guardByRole([Role.CUISINIER, Role.BARMAN]), // Seuls les cuisiniers et barmen peuvent mettre à jour
  commandeCtrl.updateStatut
])
router.get('/:id', authMiddleware, commandeCtrl.getCommandeDetails)

export default router