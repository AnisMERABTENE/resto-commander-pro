import cron from 'node-cron';
import { dailyStockCheck } from './modules/inventory/inventory.service';

// Exécute la vérification de stock tous les jours à minuit
export const initCronJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Exécution de la vérification quotidienne des stocks');
    await dailyStockCheck();
  });
};