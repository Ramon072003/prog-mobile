export const requestForegroundPermissionsAsync = jest.fn().mockResolvedValue({ status: "granted" });
export const getCurrentPositionAsync = jest.fn().mockResolvedValue({
  coords: {
    latitude: -23.55052,
    longitude: -46.633308,
  },
});

export default {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
};
