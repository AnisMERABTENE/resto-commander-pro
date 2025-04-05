import { Response } from 'express'
import { AuthRequest } from '../../shared/middlewares/auth.middleware'
import * as commandeService from './commande.service'
import { getIO } from '../../server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createCommande = async (req: AuthRequest, res: Response): Promise<void> => {
  const commande = await commandeService.create(
    req.user!.userId,
    req.user!.restaurantId,
    req.body
  )

  // La notification est désormais gérée dans le service
  // getIO().to('CUISINIER').emit('commande:new', commande) 

  res.status(201).json(commande)
}

export const updateStatut = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params
  const { statut, montantTotal } = req.body

  // Si c'est un paiement et qu'aucun montant n'est fourni, calculer automatiquement
  let montantFinal = montantTotal;
  if ((statut === 'payée' || statut === 'terminée') && !montantFinal) {
    montantFinal = await commandeService.calculateTotal(id);
  }

  const commande = await commandeService.updateStatut(
    req.user!.restaurantId,
    id,
    statut,
    montantFinal
  )

  if (!commande) {
    res.status(404).json({ error: 'Commande non trouvée' })
    return
  }

  // 🔔 Notifie tous les serveurs connectés
  getIO().to('SERVEUR').emit(`commande:${statut}`, commande)

  res.status(200).json(commande)
}

// Nouvelle fonction pour obtenir les détails d'une commande avec le total
export const getCommandeDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  
  const commande = await prisma.commande.findUnique({
    where: { 
      id,
      table: {
        restaurantId: req.user!.restaurantId
      }
    },
    include: {
      produits: {
        include: {
          produit: true
        }
      },
      table: true,
      serveur: {
        select: {
          id: true,
          nom: true,
          email: true,
          role: true
        }
      }
    }
  });
  
  if (!commande) {
    res.status(404).json({ error: 'Commande non trouvée' });
    return;
  }
  
  // Calculer le total si non défini
  let calculatedTotal = commande.montantTotal;
  if (!calculatedTotal) {
    calculatedTotal = commande.produits.reduce((sum: number, item: any) => {
      return sum + (item.produit.prix * item.quantite);
    }, 0);
  }
  
  res.json({
    ...commande,
    montantTotal: calculatedTotal
  });
}