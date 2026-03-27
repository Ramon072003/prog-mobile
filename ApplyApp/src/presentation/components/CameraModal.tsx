import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

export function CameraModal({ visible, onClose, onCapture }: CameraModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return null;

  async function handleCapture() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) onCapture(photo.uri);
    }
  }

  return (
    <Modal visible={visible} animationType="slide">
      {!permission.granted ? (
        <View style={styles.permissionContainer}>
          <Text style={styles.text}>Precisamos de permissão para usar a câmera</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Conceder Permissão</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <CameraView style={styles.camera} ref={cameraRef}>
          <View style={styles.controls}>
            <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
              <View style={styles.innerCircle} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
              <Ionicons name="close" size={32} color="#FFF" />
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  camera: { flex: 1 },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: { color: "#FFF", textAlign: "center", marginBottom: 20 },
  button: { backgroundColor: "#00C853", padding: 15, borderRadius: 8 },
  buttonText: { color: "#000", fontWeight: "bold" },
  closeButton: { marginTop: 20 },
  closeText: { color: "#666" },
  controls: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 40,
  },
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF",
  },
  closeIcon: {
    position: "absolute",
    top: 50,
    right: 30,
  },
});
