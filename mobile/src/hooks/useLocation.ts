import { useState } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
  lat: number;
  lng: number;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getLocation = async (): Promise<LocationData | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('Permiso de ubicación denegado');
        return null;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationData = {
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      };

      setLocation(locationData);
      return locationData;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  return { location, error, getLocation };
}
