export type RegisterDTO = {
    nom: string
    email: string
    password: string
    role: 'SERVEUR' | 'BARMAN' | 'CUISINIER' | 'PATRON'
    restaurantId: string
  }
  
  export type LoginDTO = {
    email: string
    password: string
  }
  