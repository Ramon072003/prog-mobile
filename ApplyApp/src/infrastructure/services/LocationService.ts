import * as Location from "expo-location";

export interface ILocationService {
  getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null>;
}

export class LocationService implements ILocationService {
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      console.log("[LOCATION] Pedindo permissão...");
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("[LOCATION] Status da permissão:", status);
      if (status !== "granted") {
        console.log("[LOCATION] Permissão negada");
        return null;
      }

      console.log("[LOCATION] Buscando posição...");
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      console.log("[LOCATION] Posição obtida:", location.coords.latitude, location.coords.longitude);

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("[LOCATION] Erro ao obter localização:", error);
      return null;
    }
  }
}
