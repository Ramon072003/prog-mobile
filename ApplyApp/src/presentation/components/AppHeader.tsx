import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../infrastructure/api/supabase";
import { useDI } from "../contexts/DIContext";

const GREETING_HOUR = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

export default function AppHeader() {
  const [userName, setUserName] = useState("Atleta");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const { getUserProfile } = useDI();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const profile = await getUserProfile.execute(user.id);
    if (profile) {
      setUserName(profile.name.split(" ")[0]);
      setAvatarUrl(profile.avatar_url ?? undefined);
    }
  }

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>{GREETING_HOUR()},</Text>
        <Text style={styles.userName}>{userName}!</Text>
        <Text style={styles.brand}>REPFORGE TRACKER</Text>
      </View>
      <View style={styles.avatarCircle}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Ionicons name="person" size={26} color="#00C853" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  greeting: { color: "#666", fontSize: 14 },
  userName: { color: "#FFF", fontSize: 26, fontWeight: "bold", marginTop: 2 },
  brand: { color: "#00C853", fontSize: 10, letterSpacing: 3, marginTop: 2 },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#00C853",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
});
