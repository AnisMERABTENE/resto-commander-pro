import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient, Role } from '@prisma/client'
import { LoginDTO, RegisterDTO } from './auth.types'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export const register = async (data: RegisterDTO) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw new Error('Email déjà utilisé')

  const hash = await bcrypt.hash(data.password, 10)

  const user = await prisma.user.create({
    data: {
      email: data.email,
      nom: data.nom,
      passwordHash: hash,
      role: data.role as Role,
      restaurantId: data.restaurantId,
    },
  })

  return generateTokens(user.id)
}

export const login = async ({ email, password }: LoginDTO) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('Identifiants invalides')

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) throw new Error('Identifiants invalides')

  return generateTokens(user.id)
}

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
  return { accessToken, refreshToken }
}
export const refreshToken = async (token: string) => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    return generateTokens(payload.userId)
  } catch (err) {
    throw new Error('Refresh token invalide ou expiré')
  }
  }
