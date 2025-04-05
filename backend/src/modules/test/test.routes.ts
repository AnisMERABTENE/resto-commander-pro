import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { AuthRequest } from '../../shared/middlewares/auth.middleware'
import { guardByRole } from '../../shared/middlewares/role.guard'
import { Role } from '@prisma/client'


const router = Router()
const prisma = new PrismaClient()

router.post('/restaurant', async (req, res) => {
  const { nom, adresse, logo } = req.body

  try {
    const resto = await prisma.restaurant.create({
      data: {
        nom,
        adresse,
        logo,
      },
    })
    res.status(201).json(resto)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})
router.get('/secure', authMiddleware, async (req: AuthRequest, res) => {
  res.json({ message: '✅ Accès autorisé', user: req.user })
})
router.get('/patron-only', authMiddleware, guardByRole(Role.PATRON), (req, res) => {
  res.json({ message: '🔐 Zone Patron' })
})
router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  res.json({ user: req.user })
})


export default router
