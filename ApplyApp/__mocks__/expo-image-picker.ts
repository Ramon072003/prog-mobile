export const MediaTypeOptions = { Images: "Images" };

export const requestMediaLibraryPermissionsAsync = jest.fn().mockResolvedValue({
  status: "granted",
  canAskAgain: true,
});

export const launchImageLibraryAsync = jest.fn().mockResolvedValue({
  canceled: false,
  assets: [{ uri: "file:///gallery/photo.jpg" }],
});

export default {
  MediaTypeOptions,
  requestMediaLibraryPermissionsAsync,
  launchImageLibraryAsync,
};
