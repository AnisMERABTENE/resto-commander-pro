import { PrismaClient, Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'
import { CommandeInput } from './commande.types'
import { getIO } from '../../server'

const prisma = new PrismaClient()

// Fonction pour gérer l'occupation des tables
const handleTableOccupation = async (tableId: string, commandeId: string, statut: string, montantTotal?: number) => {
  if (statut === 'en_attente') {
    // Une nouvelle commande est créée, vérifier si la table est déjà occupée
    const existingOccupation = await prisma.$queryRaw`
      SELECT * FROM "TableOccupation" 
      WHERE "tableId" = ${tableId} AND "finOccupation" IS NULL
      LIMIT 1
    `;
    
    if (!existingOccupation || (Array.isArray(existingOccupation) && existingOccupation.length === 0)) {
      // Générer un UUID à l'aide de Prisma
      const uuid = await prisma.$queryRaw`SELECT gen_random_uuid() as uuid`;
      const generatedUuid = (uuid as any)[0].uuid;
      
      // Créer une nouvelle occupation
      await prisma.$executeRaw`
        INSERT INTO "TableOccupation" ("id", "tableId", "debutOccupation") 
        VALUES (${generatedUuid}, ${tableId}, ${new Date()})
      `;
      
      // Mettre à jour le statut de la table
      await prisma.table.update({
        where: { id: tableId },
        data: { statut: 'occupée' }
      });
    }
  } else if (statut === 'payée' || statut === 'terminée') {
    // Terminer l'occupation de la table
    const occupations = await prisma.$queryRaw`
      SELECT * FROM "TableOccupation" 
      WHERE "tableId" = ${tableId} AND "finOccupation" IS NULL
      LIMIT 1
    `;
    
    if (occupations && Array.isArray(occupations) && occupations.length > 0) {
      const occupation = occupations[0] as any;
      
      await prisma.$executeRaw`
        UPDATE "TableOccupation" 
        SET "finOccupation" = ${new Date()}, 
            "montantTotal" = ${montantTotal || 0}
        WHERE "id" = ${occupation.id}
      `;
      
      // Mettre à jour le statut de la table
      await prisma.table.update({
        where: { id: tableId },
        data: { statut: 'libre' }
      });
    }
  }
};

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

  // Gérer l'occupation de la table
  await handleTableOccupation(data.tableId, commande.id, 'en_attente');

  const io = getIO()

  const produits = await prisma.produit.findMany({
    where: {
      id: { in: data.produits.map(p => p.produitId) }
    }
  })

  // 🔽 Stock update + alerte stock bas
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

  // 🔥 Enrichissement des détails des produits
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

  // 📋 Séparation des produits par type pour les notifications
  const produitsBarman = commandeWithDetails.produits.filter(p => p.type === 'boisson')
  const produitsCuisinier = commandeWithDetails.produits.filter(p => p.type !== 'boisson')

  // ➕ Envoi Socket par rôle avec seulement les produits concernés
  if (produitsCuisinier.length > 0) {
    io.to('CUISINIER').emit('commande:new', {
      ...commandeWithDetails,
      produits: produitsCuisinier
    })
  }

  if (produitsBarman.length > 0) {
    io.to('BARMAN').emit('commande:new', {
      ...commandeWithDetails,
      produits: produitsBarman
    })
  }

  return commande
}

export const updateStatut = async (restaurantId: string, id: string, statut: string, montantTotal?: number) => {
  // Récupérer la commande pour vérifier l'accès et obtenir la tableId
  const commande = await prisma.commande.findUnique({
    where: { id },
    include: { table: true }
  });
  
  if (!commande || commande.table.restaurantId !== restaurantId) {
    return null;
  }
  
  // Mise à jour des timestamps en fonction du statut
  const updates: any = { statut };
  
  if (statut === 'en_preparation') {
    updates.preparationAt = new Date();
  } else if (statut === 'servie') {
    updates.serviAt = new Date();
  } else if (statut === 'payée' || statut === 'terminée') {
    updates.regleAt = new Date();
    updates.montantTotal = montantTotal;
  }
  
  // Mettre à jour la commande
  const updatedCommande = await prisma.commande.update({
    where: { id },
    data: updates,
    include: { produits: true }
  });
  
  // Gérer l'occupation de la table si nécessaire
  if (statut === 'payée' || statut === 'terminée') {
    await handleTableOccupation(commande.tableId, id, statut, montantTotal);
  }
  
  return updatedCommande;
}

// Ajouter cette fonction pour calculer le montant total d'une commande
export const calculateTotal = async (id: string) => {
  const commande = await prisma.commande.findUnique({
    where: { id },
    include: {
      produits: {
        include: {
          produit: true
        }
      }
    }
  });
  
  if (!commande) return null;
  
  const total = commande.produits.reduce((sum: number, item: any) => {
    return sum + (item.produit.prix * item.quantite);
  }, 0);
  
  return total;
}