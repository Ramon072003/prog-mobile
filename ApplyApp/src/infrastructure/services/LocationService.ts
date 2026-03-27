import * as Location from "expo-location";

export interface ILocationService {
  getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null>;
}

export class LocationService implements ILocationService {
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Erro ao obter localização:", error);
      return null;
    }
  }
}
