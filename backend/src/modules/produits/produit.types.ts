export type ProduitInput = {
    nom: string
    description?: string
    type: 'plat' | 'boisson' | 'dessert'
    prix: number
    stockTotal: number
    unite: string
    volumeUnitaire: number
  }
  