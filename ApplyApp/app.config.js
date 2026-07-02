export default {
  expo: {
    name: "Repforge Tracker",
    slug: "ApplyApp",
    scheme: "applyapp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.ApplyApp",
    },
    android: {
      package: "com.anonymous.ApplyApp",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "b1757ed2-511c-44e4-8a05-1ee32c12627d",
      },
    },
    plugins: [
      "expo-sqlite",
      "expo-router",
      "expo-asset",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Permite que o app salve a localização do seu treino.",
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission: "Permite que o app tire fotos dos exercícios.",
        },
      ],
    ],
  },
};
