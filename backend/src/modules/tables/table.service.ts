import { PrismaClient } from '@prisma/client'
import { TableInput } from './table.types'

const prisma = new PrismaClient()

export const findAll = async (restaurantId: string) => {
  return prisma.table.findMany({
    where: { restaurantId },
    orderBy: { createdAt: 'desc' }
  })
}

export const create = async (restaurantId: string, data: TableInput) => {
  return prisma.table.create({
    data: {
      ...data,
      statut: data.statut || 'libre',
      restaurantId
    }
  })
}

export const update = async (restaurantId: string, id: string, data: TableInput) => {
  return prisma.table.updateMany({
    where: { id, restaurantId },
    data
  })
}

export const remove = async (restaurantId: string, id: string) => {
  return prisma.table.deleteMany({
    where: { id, restaurantId }
  })
}
