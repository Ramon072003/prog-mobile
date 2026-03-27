import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SQLiteWorkoutRepository } from "../../src/infrastructure/repositories/SQLiteWorkoutRepository";
import { Workout } from "../../src/domain/entities/Workout";
import { supabase } from "../../src/infrastructure/api/supabase";

export default function HomeScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const workoutRepo = new SQLiteWorkoutRepository();

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function loadWorkouts() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Mocking weekly history for now
        const start = new Date();
        start.setDate(start.getDate() - 7);
        const data = await workoutRepo.findWeeklyByUserId(user.id, start.toISOString().split("T")[0], new Date().toISOString().split("T")[0]);
        setWorkouts(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function startWorkout() {
    router.push("/(app)/active-workout");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Repforge Tracker</Text>
        <TouchableOpacity onPress={() => supabase.auth.signOut()}>
          <Ionicons name="log-out-outline" size={24} color="#00C853" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Seu Histórico Semanal</Text>

      {loading ? (
        <ActivityIndicator color="#00C853" size="large" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.workoutCard}>
              <View>
                <Text style={styles.workoutDate}>{item.date}</Text>
                <Text style={styles.workoutStatus}>Status: {item.status === "completed" ? "Concluído" : "Em aberto"}</Text>
              </View>
              {item.sync_status === "synced" && (
                <Ionicons name="cloud-done-outline" size={20} color="#00C853" />
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum treino registrado esta semana.</Text>
          }
          style={styles.list}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={startWorkout}>
        <Ionicons name="add" size={32} color="#000" />
        <Text style={styles.fabText}>Iniciar Treino</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00C853",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "600",
    marginBottom: 15,
  },
  list: {
    flex: 1,
  },
  workoutCard: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#00C853",
  },
  workoutDate: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  workoutStatus: {
    color: "#666",
    fontSize: 14,
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 50,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    left: 20,
    backgroundColor: "#00C853",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#00C853",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 10,
  },
});
