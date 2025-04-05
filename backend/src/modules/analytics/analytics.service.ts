import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getConsommationParJour = async (restaurantId: string, dateDebut: Date, dateFin: Date) => {
  return prisma.$queryRaw`
    SELECT 
      DATE(c."createdAt") as jour,
      SUM(cp.quantite) as total_produits,
      COUNT(DISTINCT c.id) as nombre_commandes
    FROM "Commande" c
    JOIN "Table" t ON c."tableId" = t.id
    JOIN "CommandeProduit" cp ON cp."commandeId" = c.id
    JOIN "Produit" p ON cp."produitId" = p.id
    WHERE t."restaurantId" = ${restaurantId}
      AND c."createdAt" BETWEEN ${dateDebut} AND ${dateFin}
    GROUP BY jour
    ORDER BY jour
  `;
};

export const getAffluenceParJour = async (restaurantId: string, dateDebut: Date, dateFin: Date) => {
  return prisma.$queryRaw`
    SELECT 
      DATE(c."createdAt") as jour,
      COUNT(DISTINCT c."tableId") as tables_utilisees,
      COUNT(DISTINCT c.id) as nombre_commandes
    FROM "Commande" c
    JOIN "Table" t ON c."tableId" = t.id
    WHERE t."restaurantId" = ${restaurantId}
      AND c."createdAt" BETWEEN ${dateDebut} AND ${dateFin}
    GROUP BY jour
    ORDER BY jour
  `;
};

export const getDateForPeriode = (periode: string): Date => {
  const now = new Date();
  
  switch (periode) {
    case '7j':
      return new Date(now.setDate(now.getDate() - 7));
    case '30j':
      return new Date(now.setDate(now.getDate() - 30));
    case '90j':
      return new Date(now.setDate(now.getDate() - 90));
    case '1y':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return new Date(now.setDate(now.getDate() - 30));
  }
};

export const getPerformanceParTable = async (restaurantId: string, periode: string) => {
  return prisma.$queryRaw`
    SELECT 
      t.nom as table_nom,
      t.numero as table_numero,
      COUNT(to.id) as nombre_occupations,
      AVG(EXTRACT(EPOCH FROM (to."finOccupation" - to."debutOccupation"))/3600) as duree_moyenne_heures,
      SUM(to."montantTotal") as revenu_total,
      SUM(to."montantTotal")/COUNT(to.id) as ticket_moyen,
      SUM(to."montantTotal")/SUM(EXTRACT(EPOCH FROM (to."finOccupation" - to."debutOccupation"))/3600) as revenu_par_heure
    FROM "Table" t
    LEFT JOIN "TableOccupation" to ON t.id = to."tableId"
    WHERE t."restaurantId" = ${restaurantId}
      AND to."debutOccupation" >= ${getDateForPeriode(periode)}
    GROUP BY t.id, t.nom, t.numero
    ORDER BY revenu_par_heure DESC
  `;
};

export const getProduitsParTable = async (restaurantId: string) => {
  return prisma.$queryRaw`
    SELECT 
      t.nom as table_nom,
      t.numero as table_numero,
      p.type as type_produit,
      p.nom as produit_nom,
      SUM(cp.quantite) as quantite_totale,
      SUM(cp.quantite * p.prix) as revenu_total
    FROM "Table" t
    JOIN "Commande" c ON t.id = c."tableId"
    JOIN "CommandeProduit" cp ON c.id = cp."commandeId"
    JOIN "Produit" p ON cp."produitId" = p.id
    WHERE t."restaurantId" = ${restaurantId}
    GROUP BY t.id, t.nom, t.numero, p.type, p.nom
    ORDER BY t.numero, quantite_totale DESC
  `;
};