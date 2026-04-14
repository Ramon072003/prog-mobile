import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../src/infrastructure/api/supabase";
import { SQLiteWorkoutRepository } from "../../src/infrastructure/repositories/SQLiteWorkoutRepository";
import { SQLiteWorkoutExerciseRepository } from "../../src/infrastructure/repositories/SQLiteWorkoutExerciseRepository";

interface Stats {
  totalWorkouts: number;
  totalExercises: number;
  avgExercisesPerWorkout: number;
  streak: number;
}

export default function StatsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const workoutRepo = new SQLiteWorkoutRepository();
  const weRepo = new SQLiteWorkoutExerciseRepository();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Last 90 days
      const start = new Date();
      start.setDate(start.getDate() - 90);
      const workouts = await workoutRepo.findWeeklyByUserId(
        user.id,
        start.toISOString().split("T")[0],
        new Date().toISOString().split("T")[0]
      );
      const completed = workouts.filter(w => w.status === "completed");

      let totalExercises = 0;
      for (const w of completed) {
        const exs = await weRepo.findByWorkoutId(w.id);
        totalExercises += exs.length;
      }

      // Calcular streak simples (dias consecutivos com treino a partir de hoje)
      const workoutDates = new Set(completed.map(w => w.date));
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 90; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().split("T")[0];
        if (workoutDates.has(key)) streak++;
        else if (i > 0) break;
      }

      setStats({
        totalWorkouts: completed.length,
        totalExercises,
        avgExercisesPerWorkout: completed.length ? Math.round(totalExercises / completed.length) : 0,
        streak,
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <ActivityIndicator color="#00C853" size="large" style={{ flex: 1, backgroundColor: "#121212" }} />;
  }

  const cards = [
    { icon: "trophy-outline" as const, label: "Treinos Completos", value: stats?.totalWorkouts ?? 0 },
    { icon: "barbell-outline" as const, label: "Exercícios Registrados", value: stats?.totalExercises ?? 0 },
    { icon: "flame-outline" as const, label: "Dias Seguidos", value: stats?.streak ?? 0 },
    { icon: "stats-chart" as const, label: "Média por Treino", value: stats?.avgExercisesPerWorkout ?? 0 },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Estatísticas</Text>
      <Text style={styles.period}>Últimos 90 dias</Text>
      <View style={styles.grid}>
        {cards.map((card) => (
          <View key={card.label} style={styles.card}>
            <Ionicons name={card.icon} size={28} color="#00C853" />
            <Text style={styles.value}>{card.value}</Text>
            <Text style={styles.label}>{card.label}</Text>
          </View>
        ))}
      </View>
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
    marginBottom: 4,
  },
  period: { color: "#666", fontSize: 13, paddingHorizontal: 20, marginBottom: 24 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 12,
  },
  card: {
    backgroundColor: "#1E1E1E",
    width: "46%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  value: { color: "#FFF", fontSize: 36, fontWeight: "bold" },
  label: { color: "#666", fontSize: 12, textAlign: "center" },
});
