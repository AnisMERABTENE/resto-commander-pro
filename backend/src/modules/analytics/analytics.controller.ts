import { Response } from 'express';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import * as analyticsService from './analytics.service';

export const getConsommationJournaliere = async (req: AuthRequest, res: Response): Promise<void> => {
  const { debut, fin } = req.query;
  
  const dateDebut = debut ? new Date(debut as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dateFin = fin ? new Date(fin as string) : new Date();
  
  const stats = await analyticsService.getConsommationParJour(
    req.user!.restaurantId,
    dateDebut,
    dateFin
  );
  
  res.json(stats);
};

export const getAffluenceJournaliere = async (req: AuthRequest, res: Response): Promise<void> => {
  const { debut, fin } = req.query;
  
  const dateDebut = debut ? new Date(debut as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dateFin = fin ? new Date(fin as string) : new Date();
  
  const stats = await analyticsService.getAffluenceParJour(
    req.user!.restaurantId,
    dateDebut,
    dateFin
  );
  
  res.json(stats);
};

export const getPerformanceTables = async (req: AuthRequest, res: Response): Promise<void> => {
  const { periode } = req.query as { periode: string };
  
  const stats = await analyticsService.getPerformanceParTable(
    req.user!.restaurantId,
    periode || '30j'
  );
  
  res.json(stats);
};

export const getProduitsParTable = async (req: AuthRequest, res: Response): Promise<void> => {
  const stats = await analyticsService.getProduitsParTable(
    req.user!.restaurantId
  );
  
  res.json(stats);
};