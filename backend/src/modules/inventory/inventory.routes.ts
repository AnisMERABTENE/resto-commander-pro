import { Router } from 'express';
import * as inventoryCtrl from './inventory.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { guardByRole } from '../../shared/middlewares/role.guard';
import { Role } from '@prisma/client';

const router = Router();

router.get('/low-stock', authMiddleware, guardByRole(Role.PATRON), inventoryCtrl.checkLowStock);
router.put('/products/:id/stock-minimum', authMiddleware, guardByRole(Role.PATRON), inventoryCtrl.updateStockMinimum);

export default router;