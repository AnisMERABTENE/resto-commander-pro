import { Response } from 'express';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import * as inventoryService from './inventory.service';

export const checkLowStock = async (req: AuthRequest, res: Response): Promise<void> => {
  const lowStockProducts = await inventoryService.checkLowStock(req.user!.restaurantId);
  res.json(lowStockProducts);
};

export const updateStockMinimum = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { stockMinimum } = req.body;
  
  const updated = await inventoryService.updateStockMinimum(
    req.user!.restaurantId,
    id,
    stockMinimum
  );
  
  res.json(updated);
};