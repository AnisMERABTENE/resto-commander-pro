import { PrismaClient } from '@prisma/client'
import { ProduitInput } from './produit.types'

const prisma = new PrismaClient()

export const findAll = async (restaurantId: string) => {
  return prisma.produit.findMany({
    where: { restaurantId },
    orderBy: { createdAt: 'desc' }
  })
}

export const create = async (restaurantId: string, data: ProduitInput) => {
  return prisma.produit.create({
    data: { ...data, restaurantId }
  })
}

export const update = async (restaurantId: string, id: string, data: ProduitInput) => {
  return prisma.produit.updateMany({
    where: { id, restaurantId },
    data
  })
}

export const remove = async (restaurantId: string, id: string) => {
  return prisma.produit.deleteMany({
    where: { id, restaurantId }
  })
}
