import { Router } from 'express';
import * as analyticsCtrl from './analytics.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { guardByRole } from '../../shared/middlewares/role.guard';
import { Role } from '@prisma/client';

const router = Router();

// Ces routes sont réservées au patron
router.get('/consommation', authMiddleware, guardByRole(Role.PATRON), analyticsCtrl.getConsommationJournaliere);
router.get('/affluence', authMiddleware, guardByRole(Role.PATRON), analyticsCtrl.getAffluenceJournaliere);
router.get('/tables/performance', authMiddleware, guardByRole(Role.PATRON), analyticsCtrl.getPerformanceTables);
router.get('/tables/produits', authMiddleware, guardByRole(Role.PATRON), analyticsCtrl.getProduitsParTable);

export default router;