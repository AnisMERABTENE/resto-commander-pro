import { Response } from 'express'
import { AuthRequest } from '../../shared/middlewares/auth.middleware'
import * as tableService from './table.service'

export const getAllTables = async (req: AuthRequest, res: Response): Promise<void> => {
  const tables = await tableService.findAll(req.user!.restaurantId)
  res.json(tables)
}

export const createTable = async (req: AuthRequest, res: Response): Promise<void> => {
  const table = await tableService.create(req.user!.restaurantId, req.body)
  res.status(201).json(table)
}

export const updateTable = async (req: AuthRequest, res: Response): Promise<void> => {
  const updated = await tableService.update(req.user!.restaurantId, req.params.id, req.body)
  res.json(updated)
}

export const deleteTable = async (req: AuthRequest, res: Response): Promise<void> => {
  await tableService.remove(req.user!.restaurantId, req.params.id)
  res.status(204).send()
}
