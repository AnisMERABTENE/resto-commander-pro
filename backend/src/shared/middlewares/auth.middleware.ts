import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    restaurantId: string
  }
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token manquant ou invalide' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable' })
      return
    }

    req.user = {
      userId: user.id,
      restaurantId: user.restaurantId
    }

    next()
  } catch (err) {
    res.status(403).json({ error: 'Token invalide' })
    return
  }
}
