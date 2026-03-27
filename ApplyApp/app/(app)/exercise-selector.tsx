import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SQLiteExerciseRepository } from "../../src/infrastructure/repositories/SQLiteExerciseRepository";
import { SQLiteWorkoutExerciseRepository } from "../../src/infrastructure/repositories/SQLiteWorkoutExerciseRepository";
import { AddExerciseToWorkout } from "../../src/application/use-cases/AddExerciseToWorkout";
import { Exercise } from "../../src/domain/entities/Exercise";

export default function ExerciseSelectorScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filtered, setFiltered] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const router = useRouter();

  const exerciseRepo = new SQLiteExerciseRepository();
  const weRepo = new SQLiteWorkoutExerciseRepository();
  const addExerciseUC = new AddExerciseToWorkout(weRepo);

  useEffect(() => {
    loadExercises();
  }, []);

  async function loadExercises() {
    setLoading(true);
    const list = await exerciseRepo.findAll();
    setExercises(list);
    setFiltered(list);
    setLoading(false);
  }

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      exercises.filter(e => 
        e.name.toLowerCase().includes(term) || 
        e.muscle_group.toLowerCase().includes(term)
      )
    );
  }, [search, exercises]);

  async function handleSelect(exercise: Exercise) {
    if (workoutId) {
      router.push({
        pathname: "/(app)/exercise-input",
        params: { 
          workoutId, 
          exerciseId: exercise.id,
          exerciseName: exercise.name
        }
      });
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#00C853" />
        </TouchableOpacity>
        <Text style={styles.title}>Selecionar Exercício</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar exercício ou músculo..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator color="#00C853" size="large" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)}>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.muscle}>{item.muscle_group}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </TouchableOpacity>
          )}
          style={styles.list}
        />
      )}
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
    alignItems: "center",
    marginBottom: 25,
  },
  title: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    height: 50,
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  muscle: {
    color: "#00C853",
    fontSize: 12,
    marginTop: 2,
  },
});
