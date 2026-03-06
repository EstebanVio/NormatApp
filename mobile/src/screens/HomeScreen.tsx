import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { remitosAPI } from '../api/client';
import { Remito } from '../types';
import { useAuthStore } from '../store/authStore';

type RootStackParamList = {
  Home: undefined;
  RemitoDetail: { remitoId: string };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, logout } = useAuthStore();
  const [remitos, setRemitos] = useState<Remito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRemitos();
  }, []);

  const loadRemitos = async () => {
    try {
      setIsLoading(true);
      const response = await remitosAPI.getRemitos();
      // Filtrar solo remitos del transporte del conductor
      const assignedRemitos = response.data.remitos.filter(
        (r: Remito) => r.estado === 'ASIGNADO' || r.estado === 'EN_ENTREGA'
      );
      setRemitos(assignedRemitos);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los remitos');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRemitos();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Confirmar', '¿Deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        onPress: async () => {
          await logout();
        },
        style: 'destructive',
      },
    ]);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ASIGNADO':
        return '#FBBF24';
      case 'EN_ENTREGA':
        return '#60A5FA';
      default:
        return '#D1D5DB';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Hola, {user?.name} 👋</Text>
            <Text style={styles.subText}>{user?.transporte?.nombre || 'Transporte Particular'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutEmoji}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summarySection}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>📦</Text>
          </View>
          <View>
            <Text style={styles.statNumber}>{remitos.length}</Text>
            <Text style={styles.statLabel}>Asignados</Text>
          </View>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Tus Entregas</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={styles.refreshText}>Actualizar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={remitos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('RemitoDetail', { remitoId: item.id })}
            style={styles.remitoCard}
          >
            <View
              style={[
                styles.estadoIndicator,
                { backgroundColor: getEstadoColor(item.estado) },
              ]}
            />
            <View style={styles.remitoContent}>
              <Text style={styles.remitoNumero}>{item.numero}</Text>
              <Text style={styles.remitoCliente}>{item.cliente}</Text>
              <Text style={styles.remitoDireccion} numberOfLines={1}>
                {item.direccion}
              </Text>
              <View style={styles.remitoFooter}>
                <Text style={styles.remitoEstado}>{item.estado}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Cargando...' : 'No hay remitos asignados'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -0.5,
  },
  subText: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 4,
    fontWeight: '500',
  },
  logoutButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutEmoji: {
    fontSize: 20,
  },
  summarySection: {
    marginTop: -30,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  statIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statIcon: {
    fontSize: 28,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    lineHeight: 32,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  refreshText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  remitoCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  estadoIndicator: {
    width: 6,
    height: '100%',
    borderRadius: 3,
    marginRight: 16,
  },
  remitoContent: {
    flex: 1,
  },
  remitoNumero: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  remitoCliente: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
    fontWeight: '600',
  },
  remitoDireccion: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  remitoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    alignItems: 'center',
  },
  remitoEstado: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
