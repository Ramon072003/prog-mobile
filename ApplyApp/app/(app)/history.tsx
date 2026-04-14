import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SQLiteWorkoutRepository } from "../../src/infrastructure/repositories/SQLiteWorkoutRepository";
import { Workout } from "../../src/domain/entities/Workout";
import { supabase } from "../../src/infrastructure/api/supabase";

export default function HistoryScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const workoutRepo = new SQLiteWorkoutRepository();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Busca últimos 90 dias
      const start = new Date();
      start.setDate(start.getDate() - 90);
      const data = await workoutRepo.findWeeklyByUserId(
        user.id,
        start.toISOString().split("T")[0],
        new Date().toISOString().split("T")[0]
      );
      setWorkouts(data);
    }
    setLoading(false);
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  }

  if (loading) {
    return <ActivityIndicator color="#00C853" size="large" style={{ flex: 1, backgroundColor: "#121212" }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Histórico</Text>

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(app)/workout/${item.id}`)}
            activeOpacity={0.8}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
              <Text style={styles.cardStatus}>
                {item.status === "completed" ? "✓ Concluído" : "● Em aberto"}
              </Text>
            </View>
            <View style={styles.cardRight}>
              {item.sync_status === "synced"
                ? <Ionicons name="cloud-done-outline" size={20} color="#00C853" />
                : <Ionicons name="time-outline" size={20} color="#666" />}
              <Ionicons name="chevron-forward" size={18} color="#333" style={{ marginTop: 4 }} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="barbell-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>Nenhum treino registrado ainda.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
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
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1E1E1E",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#00C853",
  },
  cardLeft: { flex: 1 },
  cardDate: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  cardStatus: { color: "#666", fontSize: 13, marginTop: 4 },
  cardRight: { alignItems: "center" },
  empty: { alignItems: "center", marginTop: 100 },
  emptyText: { color: "#666", marginTop: 15, fontSize: 16 },
});
