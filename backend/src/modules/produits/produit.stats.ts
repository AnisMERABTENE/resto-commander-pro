import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getTopProduits = async (restaurantId: string) => {
  const result = await prisma.commandeProduit.groupBy({
    by: ['produitId'],
    where: {
      produit: {
        restaurantId
      }
    },
    _sum: {
      quantite: true
    },
    orderBy: {
      _sum: {
        quantite: 'desc'
      }
    },
    take: 5, // top 5
  })

  // Récupère les infos des produits correspondants
  const produits = await prisma.produit.findMany({
    where: {
      id: { in: result.map(r => r.produitId) }
    }
  })

  return result.map(r => {
    const produit = produits.find(p => p.id === r.produitId)
    return {
      id: produit?.id,
      nom: produit?.nom,
      totalCommandé: r._sum.quantite
    }
  })
}
