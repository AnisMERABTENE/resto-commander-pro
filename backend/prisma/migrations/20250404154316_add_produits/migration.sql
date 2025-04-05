-- CreateTable
CREATE TABLE "Produit" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL,
    "stockTotal" DOUBLE PRECISION NOT NULL,
    "unite" TEXT NOT NULL,
    "volumeUnitaire" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Produit" ADD CONSTRAINT "Produit_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
