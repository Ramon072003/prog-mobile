import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Modal, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../src/infrastructure/api/supabase";
import { UserProfile } from "../../src/domain/entities/UserProfile";
import { AvatarPicker } from "../../src/presentation/components/AvatarPicker";
import { useDI } from "../../src/presentation/contexts/DIContext";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const {
    userProfileRepo: localRepo,
    remoteUserProfileRepo: remoteRepo,
    getUserProfile: getProfileUC,
    updateUserAvatar: updateAvatarUC,
  } = useDI();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setEmail(user.email ?? "");
      const p = await getProfileUC.execute(user.id);
      setProfile(p);
    }
    setLoading(false);
  }

  async function handleAvatarChanged(uri: string) {
    if (!profile) return;
    setUploadingAvatar(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const resultUrl = await updateAvatarUC.execute(user.id, uri);
      setProfile((prev) =>
        prev ? new UserProfile({ ...prev.toJSON(), avatar_url: resultUrl ?? undefined }) : prev
      );
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar a foto de perfil.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
    if (!profile) return;
    setUploadingAvatar(true);
    try {
      profile.avatar_url = undefined;
      profile.updated_at = new Date().toISOString();
      await localRepo.update(profile);
      try { await remoteRepo.update(profile); } catch { /* silencioso */ }
      setProfile(new UserProfile({ ...profile.toJSON(), avatar_url: undefined }));
    } catch {
      Alert.alert("Erro", "Não foi possível remover a foto.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSaveName() {
    if (!profile || !newName.trim() || newName.trim().length < 2) {
      Alert.alert("Erro", "Nome deve ter pelo menos 2 caracteres.");
      return;
    }
    setSaving(true);
    try {
      profile.updateName(newName.trim());
      await localRepo.update(profile);
      try { await remoteRepo.update(profile); } catch { /* sync em background */ }
      setProfile({ ...profile } as UserProfile);
      setEditModalVisible(false);
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    Alert.alert("Sair", "Deseja mesmo sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => supabase.auth.signOut() },
    ]);
  }

  if (loading) {
    return <ActivityIndicator color="#00C853" size="large" style={{ flex: 1, backgroundColor: "#121212" }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Meu Perfil</Text>

      <View style={styles.avatarContainer}>
        <AvatarPicker
          avatarUrl={profile?.avatar_url}
          uploading={uploadingAvatar}
          onImageSelected={handleAvatarChanged}
          onRemove={handleRemoveAvatar}
        />
        <Text style={styles.name}>{profile?.name ?? "Atleta"}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          setNewName(profile?.name ?? "");
          setEditModalVisible(true);
        }}
      >
        <Ionicons name="create-outline" size={22} color="#00C853" />
        <Text style={styles.menuText}>Editar Nome</Text>
        <Ionicons name="chevron-forward" size={18} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, styles.menuDanger]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#FF5252" />
        <Text style={[styles.menuText, { color: "#FF5252" }]}>Sair da Conta</Text>
      </TouchableOpacity>

      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Nome</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Novo nome"
              placeholderTextColor="#666"
              autoCapitalize="words"
              autoFocus
            />
            <TouchableOpacity
              style={[styles.modalButton, saving && { opacity: 0.7 }]}
              onPress={handleSaveName}
              disabled={saving}
            >
              <Text style={styles.modalButtonText}>{saving ? "Salvando..." : "Salvar"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  avatarContainer: { alignItems: "center", marginBottom: 40, gap: 12 },
  name: { color: "#FFF", fontSize: 22, fontWeight: "bold" },
  email: { color: "#666", fontSize: 14 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  menuDanger: { borderWidth: 1, borderColor: "#FF525244" },
  menuText: { color: "#FFF", fontSize: 16, flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  modalInput: {
    backgroundColor: "#2A2A2A",
    color: "#FFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: "#00C853",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  modalButtonText: { color: "#000", fontWeight: "bold", fontSize: 16 },
  cancelText: { color: "#666", textAlign: "center", fontSize: 15 },
});
