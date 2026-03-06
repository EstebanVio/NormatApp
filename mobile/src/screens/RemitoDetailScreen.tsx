import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { remitosAPI, entregasAPI, API_URL } from '../api/client';
import { Remito } from '../types';
import { useLocation } from '../hooks/useLocation';
import Button from '../components/Button';
import Input from '../components/Input';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  RemitoDetail: { remitoId: string };
  Home: undefined;
};

type RemitoDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RemitoDetail'>;
type RemitoDetailScreenRouteProp = RouteProp<RootStackParamList, 'RemitoDetail'>;

interface RemitoDetailScreenProps {
  navigation: RemitoDetailScreenNavigationProp;
  route: RemitoDetailScreenRouteProp;
}

export default function RemitoDetailScreen({ navigation, route }: RemitoDetailScreenProps) {
  const { remitoId } = route.params;
  const [remito, setRemito] = useState<Remito | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDelivering, setIsDelivering] = useState(false);
  const [nombreReceptor, setNombreReceptor] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const { location, getLocation } = useLocation();

  useEffect(() => {
    loadRemito();
  }, []);

  const loadRemito = async () => {
    try {
      setIsLoading(true);
      const response = await remitosAPI.getRemitoById(remitoId);
      setRemito(response.data);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo cargar el remito');
    } finally {
      setIsLoading(false);
    }
  };

  const takeSignature = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara para capturar la firma');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0].base64) {
        setSignature(result.assets[0].base64);
        // También obtener ubicación al capturar firma
        await getLocation();
      }
    } catch (error) {
      Alert.alert('Error', 'Error al acceder a la cámara');
    }
  };

  const handleDeliver = async () => {
    if (!nombreReceptor) {
      Alert.alert('Validación', 'Por favor ingresa el nombre del receptor');
      return;
    }

    if (!signature) {
      Alert.alert('Validación', 'Por favor captura una foto/firma');
      return;
    }

    try {
      setIsDelivering(true);

      const locData = location || (await getLocation());
      if (!locData) {
        Alert.alert('Error', 'No se pudo obtener la ubicación. Asegurate de tener GPS activado.');
        return;
      }

      const entregaData = {
        remitoId,
        nombreReceptor,
        firmaBase64: signature,
        lat: locData.lat,
        lng: locData.lng,
      };

      try {
        // Intentar enviar al servidor
        await entregasAPI.register(entregaData);
        Alert.alert('Éxito', 'Entrega registrada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } catch (error: any) {
        // Si falla por conectividad, guardar offline
        if (!error.response) {
          const entregas = await AsyncStorage.getItem('pendingEntregas');
          const list = entregas ? JSON.parse(entregas) : [];
          list.push({ ...entregaData, savedAt: new Date().toISOString() });
          await AsyncStorage.setItem('pendingEntregas', JSON.stringify(list));
          Alert.alert(
            'Guardado offline',
            'Sin conexión. La entrega se sincronizará automáticamente cuando haya internet.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert('Error', error.response?.data?.error || 'No se pudo registrar la entrega');
        }
      }
    } finally {
      setIsDelivering(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text>Cargando remito...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!remito) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text>Remito no encontrado</Text>
          <Button title="Volver" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Volver</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Información del Remito</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Número:</Text>
              <Text style={styles.value}>{remito.numero}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Cliente:</Text>
              <Text style={styles.value}>{remito.cliente}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>{remito.direccion}</Text>
            </View>
            {remito.observaciones && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Observaciones:</Text>
                <Text style={styles.value}>{remito.observaciones}</Text>
              </View>
            )}
            {remito.archivoUrl && (
              <View style={styles.remitoFileSection}>
                <Text style={styles.formLabel}>Remito Digital (Adjunto)</Text>
                {remito.archivoUrl.toLowerCase().endsWith('.pdf') ? (
                  <TouchableOpacity
                    style={styles.pdfButton}
                    onPress={() => Alert.alert('Información', 'Para ver el PDF completo usa el panel web o una app compatible.')}
                  >
                    <Text style={styles.pdfButtonText}>📄 Ver PDF (Remito Scaneado)</Text>
                  </TouchableOpacity>
                ) : (
                  <Image
                    source={{ uri: remito.archivoUrl.startsWith('http') ? remito.archivoUrl : `${API_URL}${remito.archivoUrl}` }}
                    style={styles.remitoImagePreview}
                  />
                )}
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Entregar Remito</Text>

            <Text style={styles.formLabel}>Nombre del Receptor</Text>
            <Input
              placeholder="Ej: Juan García"
              value={nombreReceptor}
              onChangeText={setNombreReceptor}
            />

            <TouchableOpacity style={styles.signatureButton} onPress={takeSignature}>
              {signature ? (
                <>
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${signature}` }}
                    style={styles.signaturePreview}
                  />
                  <Text style={[styles.signatureButtonText, { color: '#16A34A', marginTop: 8 }]}>
                    ✓ Foto capturada - Toca para cambiar
                  </Text>
                </>
              ) : (
                <Text style={styles.signatureButtonText}>📷 Tomar foto como firma</Text>
              )}
            </TouchableOpacity>

            {location && (
              <View style={styles.locationBox}>
                <Text style={styles.locationText}>
                  📍 Ubicación: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </Text>
              </View>
            )}

            <Button
              title="Confirmar Entrega"
              onPress={handleDeliver}
              loading={isDelivering}
              disabled={!nombreReceptor || !signature}
            />
          </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  signatureButton: {
    backgroundColor: '#E0E7FF',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 12,
  },
  signatureButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
  locationBox: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    marginBottom: 16,
  },
  locationText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '500',
  },
  signaturePreview: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    resizeMode: 'cover',
  },
  remitoFileSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  pdfButton: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center',
  },
  pdfButtonText: {
    color: '#991B1B',
    fontWeight: 'bold',
    fontSize: 14,
  },
  remitoImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#F9FAFB',
  },
});
