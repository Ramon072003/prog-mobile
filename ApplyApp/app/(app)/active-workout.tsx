import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CreateWorkout } from "../../src/application/use-cases/CreateWorkout";
import { CompleteWorkout } from "../../src/application/use-cases/CompleteWorkout";
import { SQLiteWorkoutRepository } from "../../src/infrastructure/repositories/SQLiteWorkoutRepository";
import { SQLiteWorkoutExerciseRepository } from "../../src/infrastructure/repositories/SQLiteWorkoutExerciseRepository";
import { Workout } from "../../src/domain/entities/Workout";
import { WorkoutExercise } from "../../src/domain/entities/WorkoutExercise";
import { supabase } from "../../src/infrastructure/api/supabase";
import { LocationService } from "../../src/infrastructure/services/LocationService";

export default function ActiveWorkoutScreen() {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [timer, setTimer] = useState(0);
  const router = useRouter();

  const workoutRepo = new SQLiteWorkoutRepository();
  const weRepo = new SQLiteWorkoutExerciseRepository();
  const createWorkoutUC = new CreateWorkout(workoutRepo);
  const completeWorkoutUC = new CompleteWorkout(workoutRepo);
  const locationService = new LocationService();

  useEffect(() => {
    initWorkout();
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (workout) {
      loadExercises();
    }
  }, [workout]);

  async function initWorkout() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const active = await createWorkoutUC.execute(user.id);
      setWorkout(active);
    }
  }

  async function loadExercises() {
    if (workout) {
      const list = await weRepo.findByWorkoutId(workout.id);
      setExercises(list);
    }
  }

  async function handleFinish() {
    if (workout) {
      const coords = await locationService.getCurrentLocation();
      await completeWorkoutUC.execute(workout.id, coords?.latitude, coords?.longitude);
      Alert.alert("Sucesso", "Treino finalizado!");
      router.replace(`/(app)/workout/${workout.id}`);
    }
  }

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.timer}>{formatTime(timer)}</Text>
        <TouchableOpacity onPress={handleFinish} style={styles.finishButton}>
          <Text style={styles.finishText}>Finalizar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>Exercício #{item.exercise_id.substr(0, 4)}</Text>
            <Text style={styles.exerciseDetails}>{item.sets} x {item.reps} — {item.weight} kg</Text>
          </View>
        )}
        ListHeaderComponent={
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.title}>Treino Ativo</Text>
            <Text style={styles.subtitle}>Esmaga que cresce! 💪</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="barbell-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>Adicione o primeiro exercício para começar.</Text>
          </View>
        }
        style={styles.list}
      />

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => router.push({
          pathname: "/(app)/exercise-selector",
          params: { workoutId: workout?.id }
        })}
      >
        <Ionicons name="add" size={24} color="#00C853" />
        <Text style={styles.addButtonText}>ADICIONAR EXERCÍCIO</Text>
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
    marginBottom: 20,
  },
  timer: {
    color: "#00C853",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  finishButton: {
    backgroundColor: "#00C853",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  finishText: {
    color: "#000",
    fontWeight: "bold",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
  },
  subtitle: {
    fontSize: 16,
    color: "#00C853",
    marginTop: 5,
  },
  list: {
    flex: 1,
  },
  exerciseCard: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#00C853",
  },
  exerciseName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  exerciseDetails: {
    color: "#00C853",
    fontSize: 14,
    marginTop: 5,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 15,
    fontSize: 16,
  },
  addButton: {
    borderWidth: 2,
    borderColor: "#00C853",
    borderStyle: "dashed",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  addButtonText: {
    color: "#00C853",
    fontWeight: "bold",
    marginLeft: 10,
  },
});
