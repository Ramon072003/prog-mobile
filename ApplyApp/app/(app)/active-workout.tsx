import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Animated, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { Workout } from "../../src/domain/entities/Workout";
import { WorkoutExercise } from "../../src/domain/entities/WorkoutExercise";
import { supabase } from "../../src/infrastructure/api/supabase";
import { useDI } from "../../src/presentation/contexts/DIContext";

const WEEK_DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default function ActiveWorkoutScreen() {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [timer, setTimer] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const router = useRouter();

  const {
    workoutExerciseRepo: weRepo,
    createWorkout: createWorkoutUC,
    completeWorkout: completeWorkoutUC,
    removeExerciseFromWorkout: removeExerciseUC,
    locationService,
  } = useDI();

  useEffect(() => {
    initWorkout();
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (workout) loadExercises();
    }, [workout])
  );

  async function initWorkout() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const active = await createWorkoutUC.execute(user.id);
      setWorkout(active);
    }
  }

  useEffect(() => {
    if (workout) loadExercises();
  }, [workout]);

  async function loadExercises() {
    if (workout) {
      const list = await weRepo.findByWorkoutId(workout.id);
      setExercises(list);
    }
  }

  async function handleFinish() {
    if (!workout) return;
    Alert.alert("Finalizar Treino", "Deseja encerrar o treino?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Finalizar", onPress: async () => {
          setFinishing(true);
          try {
            const coords = await locationService.getCurrentLocation();
            await completeWorkoutUC.execute(workout.id, coords?.latitude, coords?.longitude);
            // TODO: adicionar duration_seconds à entidade Workout e ao repositório
            try {
              const { getDatabase } = await import("../../src/infrastructure/database/sqlite");
              const db = await getDatabase();
              await db.runAsync("UPDATE workouts SET duration_seconds = ? WHERE id = ?", [timer, workout.id]);
            } catch { /* ignore */ }
            router.replace(`/(app)/workout/${workout.id}`);
          } catch (err) {
            Alert.alert("Erro", String(err));
          } finally {
            setFinishing(false);
          }
        }
      },
    ]);
  }

  async function handleRemove(id: string) {
    Alert.alert("Remover Exercício", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover", style: "destructive", onPress: async () => {
          await removeExerciseUC.execute(id);
          loadExercises();
        }
      },
    ]);
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const today = new Date();
  const dayName = WEEK_DAYS[today.getDay()];
  const dateStr = today.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Treino de {dayName}</Text>
          <Text style={styles.headerDate}>{dateStr}</Text>
        </View>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>
      </View>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardBody}>
              <Text style={styles.cardName}>Exercício</Text>
              <Text style={styles.cardStats}>{item.sets} séries · {item.reps} reps · {item.weight} kg</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => router.push({
                  pathname: "/(app)/exercise-input",
                  params: {
                    workoutId: workout?.id ?? "",
                    exerciseId: item.exercise_id,
                    exerciseName: "Exercício",
                    editId: item.id,
                    editSets: String(item.sets),
                    editReps: String(item.reps),
                    editWeight: String(item.weight),
                  }
                })}
              >
                <Ionicons name="create-outline" size={18} color="#00C853" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemove(item.id)}>
                <Ionicons name="trash-outline" size={18} color="#FF5252" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="barbell-outline" size={64} color="#2A2A2A" />
            <Text style={styles.emptyText}>Adicione o primeiro exercício!</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 180 }}
      />

      {/* Bottom actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push({ pathname: "/(app)/exercise-selector", params: { workoutId: workout?.id } })}
        >
          <Ionicons name="add" size={22} color="#00C853" />
          <Text style={styles.addBtnText}>EXERCÍCIO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.finishBtn, finishing && { opacity: 0.7 }]} onPress={handleFinish} disabled={finishing}>
          <Text style={styles.finishBtnText}>{finishing ? "FINALIZANDO..." : "FINALIZAR"}</Text>
        </TouchableOpacity>
      </View>

      {finishing && (
        <View style={styles.finishingOverlay}>
          <ActivityIndicator color="#00C853" size="large" />
          <Text style={styles.finishingText}>Obtendo localização...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: {
    flexDirection: "row", alignItems: "flex-start",
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: "#1E1E1E",
  },
  headerCenter: { flex: 1, marginLeft: 14 },
  headerTitle: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  headerDate: { color: "#666", fontSize: 11, marginTop: 2 },
  timerBox: {
    backgroundColor: "#1E1E1E", paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 20,
  },
  timerText: { color: "#00C853", fontWeight: "bold", fontFamily: "monospace" },
  card: {
    backgroundColor: "#1E1E1E", marginHorizontal: 20,
    marginTop: 12, padding: 16, borderRadius: 14,
    flexDirection: "row", alignItems: "center",
    borderLeftWidth: 4, borderLeftColor: "#00C853",
  },
  cardBody: { flex: 1 },
  cardName: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  cardStats: { color: "#00C853", fontSize: 13, marginTop: 4 },
  cardActions: { flexDirection: "row", gap: 12 },
  editBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#2A2A2A", justifyContent: "center", alignItems: "center",
  },
  deleteBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#2A2A2A", justifyContent: "center", alignItems: "center",
  },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyText: { color: "#444", fontSize: 15, marginTop: 16 },
  footer: {
    position: "absolute", bottom: 24, left: 20, right: 20,
    flexDirection: "row", gap: 12,
  },
  addBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#00C853", borderRadius: 30,
    paddingVertical: 16, gap: 8,
  },
  addBtnText: { color: "#00C853", fontWeight: "bold", fontSize: 14 },
  finishBtn: {
    flex: 1, backgroundColor: "#00C853",
    borderRadius: 30, paddingVertical: 16, alignItems: "center", justifyContent: "center",
  },
  finishBtnText: { color: "#000", fontWeight: "bold", fontSize: 14 },
  finishingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  finishingText: { color: "#FFF", fontSize: 16 },
});
