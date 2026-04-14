import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { CameraModal } from "./CameraModal";

interface AvatarPickerProps {
  avatarUrl?: string | null;
  uploading: boolean;
  onImageSelected: (uri: string) => void;
  onRemove?: () => void;
}

export function AvatarPicker({
  avatarUrl,
  uploading,
  onImageSelected,
  onRemove,
}: AvatarPickerProps) {
  const [cameraVisible, setCameraVisible] = useState(false);

  function showOptions() {
    const options: { text: string; onPress: () => void; style?: "cancel" | "destructive" }[] = [
      { text: "Tirar foto", onPress: openCamera },
      { text: "Escolher da galeria", onPress: openGallery },
    ];

    if (avatarUrl) {
      options.push({
        text: "Remover foto",
        style: "destructive",
        onPress: () => onRemove?.(),
      });
    }

    options.push({ text: "Cancelar", onPress: () => {}, style: "cancel" });

    Alert.alert("Foto de Perfil", "Escolha uma opção", options);
  }

  function openCamera() {
    setCameraVisible(true);
  }

  async function openGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à sua galeria para selecionar uma foto.",
        [{ text: "OK" }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
    }
  }

  function handleCapture(uri: string) {
    setCameraVisible(false);
    onImageSelected(uri);
  }

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={showOptions}
        disabled={uploading}
        accessibilityLabel="Alterar foto de perfil"
        testID="avatar-picker"
      >
        {/* Foto ou ícone padrão */}
        <View style={styles.avatar}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.image}
              testID="avatar-image"
            />
          ) : (
            <Ionicons
              name="person"
              size={52}
              color="#00C853"
              testID="avatar-default-icon"
            />
          )}
        </View>

        {/* Loading overlay */}
        {uploading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#00C853" size="small" />
          </View>
        )}

        {/* Botão de edição */}
        {!uploading && (
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={14} color="#000" />
          </View>
        )}
      </TouchableOpacity>

      <CameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={handleCapture}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignSelf: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#00C853",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#00C853",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#121212",
  },
});
