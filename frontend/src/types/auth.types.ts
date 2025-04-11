export interface RegisterFormData {
    nom: string;
    email: string;
    password: string;
    confirmPassword: string;
    nomRestaurant: string;
  }
  
  export interface LoginFormData {
    email: string;
    password: string;
  }
  
  export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
  }
  
  export interface User {
    userId: string;
    restaurantId: string;
  }