export type CommandeProduitInput = {
    produitId: string
    quantite: number
    notes?: string
  }
  
  export type CommandeInput = {
    tableId: string
    produits: CommandeProduitInput[]
  }
  