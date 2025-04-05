import { Request, Response, NextFunction } from 'express'
import { PrismaClient, Role } from '@prisma/client'
import { AuthRequest } from './auth.middleware'

const prisma = new PrismaClient()

export const guardByRole = (roles: Role[] | Role) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non authentifié' })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
       res.status(404).json({ error: 'Utilisateur non trouvé' })
       return
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles]

    if (!allowedRoles.includes(user.role)) {
       res.status(403).json({ error: 'Accès interdit (rôle)' })
       return
    }

    next()
  }
}
