import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import Input from '../components/Input';
import Button from '../components/Button';

export default function LoginScreen() {
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('conductor1@remitos.local');
  const [password, setPassword] = useState('driver123');

  const handleLogin = async () => {
    try {
      await login(email, password);
      // No es necesario navegar manualmente: App.tsx detecta isAuthenticated y muestra HomeScreen
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Remitos Digitales</Text>
          <Text style={styles.subtitle}>App para Conductores</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Text style={[styles.label, styles.labelMargin]}>Contraseña</Text>
          <Input
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            title={isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            onPress={handleLogin}
            disabled={!email || !password}
            loading={isLoading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.demoText}>Credenciales de prueba:</Text>
          <Text style={styles.demoCredential}>Email: conductor1@remitos.local</Text>
          <Text style={styles.demoCredential}>Contraseña: driver123</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  labelMargin: {
    marginTop: 16,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    padding: 12,
    borderRadius: 4,
    marginVertical: 16,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
  },
  footer: {
    backgroundColor: '#E0E7FF',
    padding: 16,
    borderRadius: 8,
  },
  demoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4338CA',
    marginBottom: 8,
  },
  demoCredential: {
    fontSize: 12,
    color: '#4338CA',
    marginBottom: 4,
  },
});
