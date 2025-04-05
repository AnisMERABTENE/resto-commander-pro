import { PrismaClient } from '@prisma/client';
import { getIO } from '../../server';

const prisma = new PrismaClient();

export const checkLowStock = async (restaurantId: string) => {
  const lowStockProducts = await prisma.produit.findMany({
    where: {
      restaurantId,
      stockTotal: {
        lt: prisma.produit.fields.stockMinimum
      }
    }
  });
  
  // Envoi des notifications en temps réel si nécessaire
  if (lowStockProducts.length > 0) {
    const io = getIO();
    io.to('PATRON').emit('stock:alert', {
      message: `${lowStockProducts.length} produits en stock bas`,
      products: lowStockProducts
    });
  }
  
  return lowStockProducts;
};

export const updateStockMinimum = async (restaurantId: string, id: string, stockMinimum: number) => {
  return prisma.produit.updateMany({
    where: { 
      id,
      restaurantId
    },
    data: { stockMinimum }
  }).then(res => res.count === 1 
    ? prisma.produit.findUnique({ where: { id } })
    : null
  );
};

// Cette fonction peut être appelée par un cron job
export const dailyStockCheck = async () => {
  const restaurants = await prisma.restaurant.findMany();
  
  for (const restaurant of restaurants) {
    const lowStockProducts = await checkLowStock(restaurant.id);
    
    // Ici, vous pourriez envoyer des emails ou autres notifications
    console.log(`Vérification quotidienne de stock pour ${restaurant.nom}: ${lowStockProducts.length} produits bas`);
  }
};