import { PrismaClient } from '@prisma/client'
import { CommandeInput } from './commande.types'
import { getIO } from '../../server'

const prisma = new PrismaClient()

export const create = async (userId: string, restaurantId: string, data: CommandeInput) => {
  const commande = await prisma.commande.create({
    data: {
      tableId: data.tableId,
      serveurId: userId,
      produits: {
        create: data.produits.map(p => ({
          produitId: p.produitId,
          quantite: p.quantite,
          notes: p.notes
        }))
      }
    },
    include: {
      produits: true
    }
  })

  const io = getIO()

  const produits = await prisma.produit.findMany({
    where: {
      id: { in: data.produits.map(p => p.produitId) }
    }
  })

  // 🔽 Stock update + split
  for (const item of data.produits) {
    const produit = produits.find(p => p.id === item.produitId)
    if (!produit) continue

    const quantiteCommandee = item.quantite * produit.volumeUnitaire
    const nouveauStock = produit.stockTotal - quantiteCommandee

    const updated = await prisma.produit.update({
      where: { id: produit.id },
      data: { stockTotal: nouveauStock }
    })

    if (updated.stockTotal < 5) {
      io.to('PATRON').emit('stock:low', {
        produitId: updated.id,
        nom: updated.nom,
        stockRestant: updated.stockTotal
      })
    }
  }

  // 🔥 Split logique
  const commandeWithDetails = {
    ...commande,
    produits: commande.produits.map(p => {
      const produitDetails = produits.find(prod => prod.id === p.produitId)
      return {
        ...p,
        type: produitDetails?.type || 'plat',
        nom: produitDetails?.nom || ''
      }
    })
  }

  // ➕ Envoi Socket par rôle
  const pourCuisine = commandeWithDetails.produits.some(p => p.type !== 'boisson')
  const pourBar = commandeWithDetails.produits.some(p => p.type === 'boisson')

  if (pourCuisine) io.to('CUISINIER').emit('commande:new', commandeWithDetails)
  if (pourBar) io.to('BARMAN').emit('commande:new', commandeWithDetails)

  return commande
}
export const updateStatut = async (restaurantId: string, id: string, statut: string) => {
  return prisma.commande.updateMany({
    where: { id, table: { restaurantId } },
    data: { statut }
  }).then(res => res.count === 1
    ? prisma.commande.findUnique({ where: { id }, include: { produits: true } })
    : null
  )
}
