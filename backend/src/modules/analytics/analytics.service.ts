import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getConsommationParJour = async (restaurantId: string, dateDebut: Date, dateFin: Date) => {
  const result = await prisma.$queryRaw`
    SELECT 
      DATE(c."createdAt") as jour,
      SUM(cp.quantite)::integer as total_produits,
      COUNT(DISTINCT c.id)::integer as nombre_commandes
    FROM "Commande" c
    JOIN "Table" t ON c."tableId" = t.id
    JOIN "CommandeProduit" cp ON cp."commandeId" = c.id
    JOIN "Produit" p ON cp."produitId" = p.id
    WHERE t."restaurantId" = ${restaurantId}
      AND c."createdAt" BETWEEN ${dateDebut} AND ${dateFin}
    GROUP BY jour
    ORDER BY jour
  `;

  // Convertir manuellement les résultats
  return (result as any[]).map(row => ({
    jour: row.jour,
    total_produits: Number(row.total_produits),
    nombre_commandes: Number(row.nombre_commandes)
  }));
};

export const getAffluenceParJour = async (restaurantId: string, dateDebut: Date, dateFin: Date) => {
  const result = await prisma.$queryRaw`
    SELECT 
      DATE(c."createdAt") as jour,
      COUNT(DISTINCT c."tableId")::integer as tables_utilisees,
      COUNT(DISTINCT c.id)::integer as nombre_commandes
    FROM "Commande" c
    JOIN "Table" t ON c."tableId" = t.id
    WHERE t."restaurantId" = ${restaurantId}
      AND c."createdAt" BETWEEN ${dateDebut} AND ${dateFin}
    GROUP BY jour
    ORDER BY jour
  `;

  // Convertir manuellement les résultats
  return (result as any[]).map(row => ({
    jour: row.jour,
    tables_utilisees: Number(row.tables_utilisees),
    nombre_commandes: Number(row.nombre_commandes)
  }));
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
  const result = await prisma.$queryRaw`
    SELECT 
      t.nom as table_nom,
      t.numero as table_numero,
      COUNT(toc.id)::integer as nombre_occupations,
      AVG(EXTRACT(EPOCH FROM (toc."finOccupation" - toc."debutOccupation"))/3600) as duree_moyenne_heures,
      SUM(toc."montantTotal") as revenu_total,
      COALESCE(SUM(toc."montantTotal")/NULLIF(COUNT(toc.id), 0), 0) as ticket_moyen,
      COALESCE(SUM(toc."montantTotal")/NULLIF(SUM(EXTRACT(EPOCH FROM (toc."finOccupation" - toc."debutOccupation"))/3600), 0), 0) as revenu_par_heure
    FROM "Table" t
    LEFT JOIN "TableOccupation" toc ON t.id = toc."tableId"
    WHERE t."restaurantId" = ${restaurantId}
      AND (toc."debutOccupation" >= ${getDateForPeriode(periode)} OR toc."debutOccupation" IS NULL)
    GROUP BY t.id, t.nom, t.numero
    ORDER BY revenu_par_heure DESC
  `;

  // Convertir manuellement les résultats
  return (result as any[]).map(row => ({
    table_nom: row.table_nom,
    table_numero: Number(row.table_numero),
    nombre_occupations: Number(row.nombre_occupations),
    duree_moyenne_heures: Number(row.duree_moyenne_heures),
    revenu_total: Number(row.revenu_total),
    ticket_moyen: Number(row.ticket_moyen),
    revenu_par_heure: Number(row.revenu_par_heure)
  }));
};

export const getProduitsParTable = async (restaurantId: string) => {
  const result = await prisma.$queryRaw`
    SELECT 
      t.nom as table_nom,
      t.numero as table_numero,
      p.type as type_produit,
      p.nom as produit_nom,
      SUM(cp.quantite)::integer as quantite_totale,
      SUM(cp.quantite * p.prix) as revenu_total
    FROM "Table" t
    JOIN "Commande" c ON t.id = c."tableId"
    JOIN "CommandeProduit" cp ON c.id = cp."commandeId"
    JOIN "Produit" p ON cp."produitId" = p.id
    WHERE t."restaurantId" = ${restaurantId}
    GROUP BY t.id, t.nom, t.numero, p.type, p.nom
    ORDER BY t.numero, quantite_totale DESC
  `;

  // Convertir manuellement les résultats
  return (result as any[]).map(row => ({
    table_nom: row.table_nom,
    table_numero: Number(row.table_numero),
    type_produit: row.type_produit,
    produit_nom: row.produit_nom,
    quantite_totale: Number(row.quantite_totale),
    revenu_total: Number(row.revenu_total)
  }));
};