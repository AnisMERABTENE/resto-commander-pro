import axios from 'axios';
import { LoginFormData, RegisterFormData, AuthTokens } from '../types/auth.types';

const API_URL = 'http://192.168.1.6:4000/api';
export const authApi = {
  async register(data: RegisterFormData): Promise<AuthTokens> {
    // Le backend attend un restaurantId, mais pour l'inscription comme patron,
    // nous allons créer un restaurant et utiliser son ID
    const restaurantResponse = await axios.post(`${API_URL}/test/restaurant`, {
      nom: data.nomRestaurant,
      adresse: "", // Optional
      logo: "", // Optional
    });
    
    const restaurantId = restaurantResponse.data.id;
    
    // Maintenant, enregistrer l'utilisateur en tant que patron
    const response = await axios.post(`${API_URL}/auth/register`, {
      nom: data.nom,
      email: data.email,
      password: data.password,
      role: "PATRON", // Par défaut le premier compte est un patron
      restaurantId: restaurantId,
    });
    
    return response.data;
  },
  
  async login(data: LoginFormData): Promise<AuthTokens> {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: data.email,
      password: data.password,
    });
    
    return response.data;
  },
  
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken,
    });
    
    return response.data;
  }
};