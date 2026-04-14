import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, ScrollView, Image,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../src/infrastructure/api/supabase";
import { GetUserProfile } from "../../src/application/use-cases/GetUserProfile";
import { GetWeeklyWorkoutsSummary, WorkoutSummaryItem } from "../../src/application/use-cases/GetWeeklyWorkoutsSummary";
import { SQLiteUserProfileRepository } from "../../src/infrastructure/repositories/SQLiteUserProfileRepository";
import { SupabaseUserProfileRepository } from "../../src/infrastructure/repositories/SupabaseUserProfileRepository";
import { SQLiteWorkoutRepository } from "../../src/infrastructure/repositories/SQLiteWorkoutRepository";
import { SQLiteWorkoutExerciseRepository } from "../../src/infrastructure/repositories/SQLiteWorkoutExerciseRepository";
import { SQLiteExerciseRepository } from "../../src/infrastructure/repositories/SQLiteExerciseRepository";

const DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const GREETING_HOUR = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

export default function HomeScreen() {
  const [userName, setUserName] = useState("Atleta");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [summary, setSummary] = useState<WorkoutSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [workoutDays, setWorkoutDays] = useState<Set<number>>(new Set());
  const router = useRouter();

  const localProfileRepo = new SQLiteUserProfileRepository();
  const remoteProfileRepo = new SupabaseUserProfileRepository();
  const workoutRepo = new SQLiteWorkoutRepository();
  const weRepo = new SQLiteWorkoutExerciseRepository();
  const exerciseRepo = new SQLiteExerciseRepository();

  const getProfileUC = new GetUserProfile(localProfileRepo, remoteProfileRepo);
  const getWeeklySummaryUC = new GetWeeklyWorkoutsSummary(workoutRepo, weRepo, exerciseRepo);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profile, weekSummary] = await Promise.all([
        getProfileUC.execute(user.id),
        getWeeklySummaryUC.execute(user.id),
      ]);

      if (profile) {
        setUserName(profile.name.split(" ")[0]);
        setAvatarUrl(profile.avatar_url ?? undefined);
      }
      setSummary(weekSummary);

      // Calcular quais dias da semana atual têm treino
      const today = new Date();
      const daySet = new Set<number>();
      for (const item of weekSummary) {
        const d = new Date(item.workout.date + "T00:00:00");
        daySet.add(d.getDay());
      }
      setWorkoutDays(daySet);
    } finally {
      setLoading(false);
    }
  }

  const todayDayIndex = new Date().getDay();

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).toUpperCase();
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{GREETING_HOUR()},</Text>
          <Text style={styles.userName}>{userName}! 💪</Text>
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

      {/* Calendário semanal */}
      <View style={styles.weekRow}>
        {DAYS.map((day, i) => {
          const isToday = i === todayDayIndex;
          const hasWorkout = workoutDays.has(i);
          return (
            <View key={i} style={styles.dayCell}>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>{day}</Text>
              <View style={[
                styles.dayDot,
                hasWorkout && styles.dayDotFilled,
                isToday && styles.dayDotToday,
              ]}>
                {hasWorkout && <Ionicons name="barbell" size={10} color={isToday ? "#000" : "#00C853"} />}
              </View>
            </View>
          );
        })}
      </View>

      {/* Lista de treinos da semana */}
      <Text style={styles.sectionTitle}>Esta semana</Text>

      {loading ? (
        <ActivityIndicator color="#00C853" size="large" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={summary}
          keyExtractor={(item) => item.workout.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(app)/workout/${item.workout.id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>{formatDate(item.workout.date)}</Text>
                {item.workout.sync_status === "synced"
                  ? <Ionicons name="cloud-done-outline" size={18} color="#00C853" />
                  : <Ionicons name="time-outline" size={18} color="#666" />}
              </View>
              <Text style={styles.cardMuscles}>
                {item.muscleGroups.length > 0
                  ? item.muscleGroups.join(" · ")
                  : "Grupos não identificados"}
              </Text>
              <Text style={styles.cardCount}>
                {item.exerciseCount} {item.exerciseCount === 1 ? "exercício" : "exercícios"}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="barbell-outline" size={60} color="#333" />
              <Text style={styles.emptyText}>Nenhum treino esta semana.</Text>
              <Text style={styles.emptySubtext}>Toque no botão abaixo para começar!</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push("/(app)/active-workout")}>
        <Ionicons name="add" size={28} color="#000" />
        <Text style={styles.fabText}>Iniciar Treino</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
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
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#1E1E1E",
    marginHorizontal: 20,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 24,
  },
  dayCell: { alignItems: "center", gap: 6 },
  dayLabel: { color: "#666", fontSize: 12, fontWeight: "600" },
  dayLabelActive: { color: "#00C853" },
  dayDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  dayDotFilled: { borderColor: "#00C853" },
  dayDotToday: { backgroundColor: "#00C853", borderColor: "#00C853" },
  sectionTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#1E1E1E",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#00C853",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  cardDate: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
  cardMuscles: { color: "#00C853", fontSize: 13, marginBottom: 4 },
  cardCount: { color: "#666", fontSize: 12 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: "#666", fontSize: 16, marginTop: 16 },
  emptySubtext: { color: "#444", fontSize: 13, marginTop: 6 },
  fab: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: "#00C853",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 30,
    gap: 10,
    shadowColor: "#00C853",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: { color: "#000", fontWeight: "bold", fontSize: 17 },
});
