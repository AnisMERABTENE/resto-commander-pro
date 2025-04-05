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

  const io = getIO()

  // Notification générique pour tous les changements de statut
  io.to('SERVEUR').emit(`commande:${statut}`, commande)

  // Notifications spécifiques supplémentaires
  switch(statut) {
    case 'en_preparation':
      io.to('SERVEUR').emit('commande:en_preparation', commande);
      break;
    case 'prete':
      io.to('SERVEUR').emit('commande:prete', commande);
      break;
    case 'servie':
      io.to('SERVEUR').emit('commande:servie', commande);
      break;
    case 'payée':
      io.to('SERVEUR').emit('commande:payée', commande);
      break;
  }

  res.status(200).json(commande)
}

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