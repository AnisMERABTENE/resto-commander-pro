import { Response } from 'express'
import * as produitService from './produit.service'
import { AuthRequest } from '../../shared/middlewares/auth.middleware'

export const getAllProduits = async (req: AuthRequest, res: Response): Promise<void> => {
  const produits = await produitService.findAll(req.user!.restaurantId)
  res.json(produits)
}

export const createProduit = async (req: AuthRequest, res: Response): Promise<void> => {
  const produit = await produitService.create(req.user!.restaurantId, req.body)
  res.status(201).json(produit)
}

export const updateProduit = async (req: AuthRequest, res: Response): Promise<void> => {
  const updated = await produitService.update(req.user!.restaurantId, req.params.id, req.body)
  res.json(updated)
}

export const deleteProduit = async (req: AuthRequest, res: Response): Promise<void> => {
  await produitService.remove(req.user!.restaurantId, req.params.id)
  res.status(204).send()
}
