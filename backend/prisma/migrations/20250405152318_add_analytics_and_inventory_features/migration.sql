-- AlterTable
ALTER TABLE "Commande" ADD COLUMN     "montantTotal" DOUBLE PRECISION,
ADD COLUMN     "preparationAt" TIMESTAMP(3),
ADD COLUMN     "regleAt" TIMESTAMP(3),
ADD COLUMN     "serviAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Produit" ADD COLUMN     "stockMinimum" DOUBLE PRECISION NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "TableOccupation" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "debutOccupation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finOccupation" TIMESTAMP(3),
    "montantTotal" DOUBLE PRECISION,
    "nombreClients" INTEGER,

    CONSTRAINT "TableOccupation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TableOccupation" ADD CONSTRAINT "TableOccupation_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
