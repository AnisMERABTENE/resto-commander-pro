import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authApi } from '../../api/auth.api';
import { RegisterFormData } from '../../types/auth.types';

export const RegisterScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    nom: '',
    email: '',
    password: '',
    confirmPassword: '',
    nomRestaurant: '',
  });

  const handleChange = (name: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.nom || !formData.email || !formData.password || !formData.confirmPassword || !formData.nomRestaurant) {
      Alert.alert('Champs requis', 'Tous les champs sont obligatoires');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur de mot de passe', 'Les mots de passe ne correspondent pas');
      return false;
    }

    if (!formData.email.includes('@')) {
      Alert.alert('Email invalide', 'Veuillez entrer un email valide');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authApi.register(formData);
      // Ici vous pourriez stocker les tokens et rediriger l'utilisateur
      Alert.alert('Inscription réussie', 'Votre compte a été créé avec succès', [
        { text: 'OK', onPress: () => navigation.navigate('Login' as never) }
      ]);
    } catch (error: any) {
      Alert.alert('Erreur d\'inscription', error.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      <Text style={styles.subtitle}>En tant que Patron</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nom complet"
        value={formData.nom}
        onChangeText={value => handleChange('nom', value)}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={value => handleChange('email', value)}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={formData.password}
        onChangeText={value => handleChange('password', value)}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirmer le mot de passe"
        secureTextEntry
        value={formData.confirmPassword}
        onChangeText={value => handleChange('confirmPassword', value)}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Nom du restaurant"
        value={formData.nomRestaurant}
        onChangeText={value => handleChange('nomRestaurant', value)}
      />
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>S'inscrire</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => navigation.navigate('Login' as never)}
      >
        <Text style={styles.linkText}>Déjà un compte? Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  button: {
    height: 50,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007BFF',
    fontSize: 14,
  },
});