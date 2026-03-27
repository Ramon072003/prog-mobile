import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { SQLiteWorkoutRepository } from "../../../src/infrastructure/repositories/SQLiteWorkoutRepository";
import { SQLiteWorkoutExerciseRepository } from "../../../src/infrastructure/repositories/SQLiteWorkoutExerciseRepository";
import { Workout } from "../../../src/domain/entities/Workout";
import { WorkoutExercise } from "../../../src/domain/entities/WorkoutExercise";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const workoutRepo = new SQLiteWorkoutRepository();
  const weRepo = new SQLiteWorkoutExerciseRepository();

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    if (id) {
      const w = await workoutRepo.findById(id);
      setWorkout(w);
      const list = await weRepo.findByWorkoutId(id);
      setExercises(list);
    }
    setLoading(false);
  }

  if (loading) return <ActivityIndicator color="#00C853" size="large" style={{ flex: 1, backgroundColor: "#121212" }} />;
  if (!workout) return <View style={styles.container}><Text style={styles.title}>Não encontrado</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#00C853" />
        </TouchableOpacity>
        <Text style={styles.title}>Resumo do Treino</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.date}>{workout.date}</Text>
        <Text style={styles.userInfo}>Sessão finalizada com sucesso!</Text>

        {workout.latitude && workout.longitude && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: workout.latitude,
                longitude: workout.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              zoomEnabled={false}
            >
              <Marker coordinate={{ latitude: workout.latitude, longitude: workout.longitude }} />
            </MapView>
            <View style={styles.mapBadge}>
              <Ionicons name="location" size={14} color="#000" />
              <Text style={styles.mapBadgeText}>Localização salva</Text>
            </View>
          </View>
        )}

        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>Exercícios Realizados</Text>
          {exercises.map((item) => (
            <View key={item.id} style={styles.exerciseCard}>
              <View>
                <Text style={styles.exerciseName}>Exercício #{item.exercise_id.substr(0, 4)}</Text>
                <Text style={styles.exerciseDetails}>{item.sets} x {item.reps} — {item.weight} kg</Text>
              </View>
              {item.media_url && (
                <View style={styles.mediaBadge}>
                  <Ionicons name="image" size={16} color="#00C853" />
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },
  content: {
    padding: 20,
  },
  date: {
    color: "#00C853",
    fontSize: 24,
    fontWeight: "bold",
  },
  userInfo: {
    color: "#666",
    fontSize: 16,
    marginTop: 5,
    marginBottom: 20,
  },
  mapContainer: {
    height: 200,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#333",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#00C853",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  mapBadgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 4,
  },
  exercisesSection: {
    marginTop: 10,
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  exerciseCard: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  mediaBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#1A4D2E",
    justifyContent: "center",
    alignItems: "center",
  },
});
