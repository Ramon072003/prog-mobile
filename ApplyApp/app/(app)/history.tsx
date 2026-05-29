import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../src/infrastructure/api/supabase";
import { useDI } from "../../src/presentation/contexts/DIContext";
import { WorkoutSummaryItem } from "../../src/application/use-cases/GetWeeklyWorkoutsSummary";

export default function HistoryScreen() {
  const [items, setItems] = useState<WorkoutSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { workoutRepo, workoutExerciseRepo, exerciseRepo } = useDI();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const start = new Date();
      start.setDate(start.getDate() - 90);
      const workouts = await workoutRepo.findWeeklyByUserId(
        user.id,
        start.toISOString().split("T")[0],
        new Date().toISOString().split("T")[0]
      );
      const allExercises = await exerciseRepo.findAll();
      const exerciseMap = new Map(allExercises.map(e => [e.id, e]));
      const summary: WorkoutSummaryItem[] = [];
      for (const workout of workouts) {
        const wes = await workoutExerciseRepo.findByWorkoutId(workout.id);
        const muscleGroupSet = new Set<string>();
        for (const we of wes) {
          const ex = exerciseMap.get(we.exercise_id);
          if (ex) muscleGroupSet.add(ex.muscle_group);
        }
        summary.push({ workout, exerciseCount: wes.length, muscleGroups: Array.from(muscleGroupSet) });
      }
      setItems(summary);
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
        data={items}
        keyExtractor={(item) => item.workout.id}
        renderItem={({ item: { workout, exerciseCount, muscleGroups } }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(app)/workout/${workout.id}`)}
            activeOpacity={0.8}
          >
            <View style={styles.cardTop}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardDate}>{formatDate(workout.date)}</Text>
                <View style={styles.cardDetails}>
                  <Ionicons name="barbell-outline" size={13} color="#00C853" />
                  <Text style={styles.cardDetailText}>{exerciseCount} exercício{exerciseCount !== 1 ? "s" : ""}</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                {workout.status === "completed"
                  ? <Ionicons name="checkmark-circle" size={22} color="#00C853" />
                  : <Ionicons name="ellipse-outline" size={22} color="#666" />}
                <Ionicons name="chevron-forward" size={18} color="#444" />
              </View>
            </View>
            {muscleGroups.length > 0 && (
              <View style={styles.muscleGroups}>
                {muscleGroups.map(mg => (
                  <View key={mg} style={styles.badge}>
                    <Text style={styles.badgeText}>{mg.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            )}
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
    borderLeftWidth: 4,
    borderLeftColor: "#00C853",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: { flex: 1 },
  cardDate: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  cardDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  cardDetailText: { color: "#999", fontSize: 13 },
  cardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  muscleGroups: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  badge: {
    backgroundColor: "#00C85322",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#00C85366",
  },
  badgeText: { color: "#00C853", fontSize: 10, fontWeight: "bold" },
  empty: { alignItems: "center", marginTop: 100 },
  emptyText: { color: "#666", marginTop: 15, fontSize: 16 },
});
