import { Router } from 'express'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { guardByRole } from '../../shared/middlewares/role.guard'
import { Role } from '@prisma/client'
import * as produitCtrl from './produit.controller'
import * as produitStats from './produit.stats'
import { AuthRequest } from '../../shared/middlewares/auth.middleware'



const router = Router()

router.get('/', authMiddleware, produitCtrl.getAllProduits)
router.post('/', authMiddleware, guardByRole(Role.PATRON), produitCtrl.createProduit)
router.put('/:id', authMiddleware, guardByRole(Role.PATRON), produitCtrl.updateProduit)
router.delete('/:id', authMiddleware, guardByRole(Role.PATRON), produitCtrl.deleteProduit)
router.get('/top', authMiddleware, async (req: AuthRequest, res) => {
    const restaurantId = req.user!.restaurantId
    const stats = await produitStats.getTopProduits(restaurantId)
    res.json(stats)
  })

export default router
