import { Response } from 'express'
import { AuthRequest } from '../../shared/middlewares/auth.middleware'
import * as commandeService from './commande.service'
import { getIO } from '../../server'



export const createCommande = async (req: AuthRequest, res: Response): Promise<void> => {
  const commande = await commandeService.create(
    req.user!.userId,
    req.user!.restaurantId,
    req.body
  )

  // 🔔 Émettre à tous les CUISINIERS (on peut filtrer selon type produit plus tard)
  getIO().to('CUISINIER').emit('commande:new', commande)

  res.status(201).json(commande)
}
export const updateStatut = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params
  const { statut } = req.body

  const commande = await commandeService.updateStatut(
    req.user!.restaurantId,
    id,
    statut
  )

  if (!commande) {
    res.status(404).json({ error: 'Commande non trouvée' })
    return
  }

  // 🔔 Notifie tous les serveurs connectés
  getIO().to('SERVEUR').emit(`commande:${statut}`, commande)

  res.status(200).json(commande)
}
