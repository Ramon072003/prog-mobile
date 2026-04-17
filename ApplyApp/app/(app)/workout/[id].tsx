import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Image, Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SQLiteWorkoutRepository } from "../../../src/infrastructure/repositories/SQLiteWorkoutRepository";
import { SQLiteWorkoutExerciseRepository } from "../../../src/infrastructure/repositories/SQLiteWorkoutExerciseRepository";
import { SQLiteExerciseRepository } from "../../../src/infrastructure/repositories/SQLiteExerciseRepository";
import { CloneWorkout } from "../../../src/application/use-cases/CloneWorkout";
import { Workout } from "../../../src/domain/entities/Workout";
import { WorkoutExercise } from "../../../src/domain/entities/WorkoutExercise";
import { supabase } from "../../../src/infrastructure/api/supabase";

interface ExerciseRow {
  we: WorkoutExercise;
  name: string;
  muscle_group: string;
}

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [rows, setRows] = useState<ExerciseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);
  const router = useRouter();

  const workoutRepo = new SQLiteWorkoutRepository();
  const weRepo = new SQLiteWorkoutExerciseRepository();
  const exerciseRepo = new SQLiteExerciseRepository();
  const cloneWorkoutUC = new CloneWorkout(workoutRepo, weRepo);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    if (id) {
      const w = await workoutRepo.findById(id);
      console.log("[DETAIL] Workout carregado:", JSON.stringify({ id: w?.id, lat: w?.latitude, lng: w?.longitude, status: w?.status }));
      setWorkout(w);
      const list = await weRepo.findByWorkoutId(id);
      const allExercises = await exerciseRepo.findAll();
      const exerciseMap = new Map(allExercises.map(e => [e.id, e]));
      setRows(list.map(we => ({
        we,
        name: exerciseMap.get(we.exercise_id)?.name ?? "Exercício",
        muscle_group: exerciseMap.get(we.exercise_id)?.muscle_group ?? "",
      })));
    }
    setLoading(false);
  }

  async function handleClone() {
    if (!workout) return;
    setCloning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const newWorkout = await cloneWorkoutUC.execute(workout.id, user.id);
      router.replace("/(app)/active-workout");
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally {
      setCloning(false);
    }
  }

  function formatDuration(secs?: number): string {
    if (!secs) return "—";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}min ${s > 0 ? `${s}s` : ""}`.trim();
  }

  const wData = workout?.toJSON() as any;

  if (loading) {
    return <ActivityIndicator color="#00C853" size="large" style={{ flex: 1, backgroundColor: "#121212" }} />;
  }
  if (!workout) {
    return <View style={styles.container}><Text style={{ color: "#FFF", padding: 20 }}>Não encontrado</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#00C853" />
        </TouchableOpacity>
        <Text style={styles.title}>Resumo do Treino</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.date}>
          {new Date(workout.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
        </Text>

        {/* Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          <View style={styles.chip}>
            <Ionicons name="barbell-outline" size={14} color="#00C853" />
            <Text style={styles.chipText}>{rows.length} exercícios</Text>
          </View>
          {wData?.duration_seconds ? (
            <View style={styles.chip}>
              <Ionicons name="time-outline" size={14} color="#00C853" />
              <Text style={styles.chipText}>{formatDuration(wData.duration_seconds)}</Text>
            </View>
          ) : null}
          {workout.latitude && workout.longitude ? (
            <View style={styles.chip}>
              <Ionicons name="location-outline" size={14} color="#00C853" />
              <Text style={styles.chipText}>{wData?.location_name ?? "Localização salva"}</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Mapa condicional */}
        {workout.latitude && workout.longitude ? (
          <TouchableOpacity
            style={styles.mapContainer}
            activeOpacity={0.8}
            onPress={() => Linking.openURL(`https://www.google.com/maps?q=${workout.latitude},${workout.longitude}`)}
          >
            <Image
              source={{ uri: `https://staticmap.openstreetmap.de/staticmap.php?center=${workout.latitude},${workout.longitude}&zoom=15&size=600x300&markers=${workout.latitude},${workout.longitude},red-pushpin` }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
            <View style={styles.mapOverlay}>
              <Ionicons name="location" size={16} color="#FFF" />
              <Text style={styles.mapOverlayText}>Abrir no Maps</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Exercícios */}
        <Text style={styles.sectionTitle}>Exercícios</Text>
        {rows.map(({ we, name, muscle_group }, i) => (
          <View key={we.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{name}</Text>
              {muscle_group ? <View style={styles.badge}><Text style={styles.badgeText}>{muscle_group.toUpperCase()}</Text></View> : null}
            </View>
            <View style={styles.stats}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>SÉRIES</Text>
                <Text style={styles.statValue}>{we.sets}</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>REPS</Text>
                <Text style={styles.statValue}>{we.reps}</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>CARGA</Text>
                <Text style={styles.statValue}>{we.weight} kg</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Footer: Iniciar treino igual */}
      <TouchableOpacity
        style={[styles.cloneBtn, cloning && { opacity: 0.7 }]}
        onPress={handleClone}
        disabled={cloning}
      >
        <Ionicons name="refresh" size={20} color="#000" />
        <Text style={styles.cloneBtnText}>{cloning ? "CRIANDO..." : "INICIAR TREINO IGUAL"}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 60, paddingHorizontal: 20, marginBottom: 20,
  },
  title: { color: "#FFF", fontSize: 18, fontWeight: "bold", marginLeft: 14 },
  body: { paddingHorizontal: 20 },
  date: { color: "#00C853", fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  chips: { marginBottom: 20 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#1E1E1E", paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: "#2A2A2A",
  },
  chipText: { color: "#FFF", fontSize: 13 },
  mapContainer: {
    height: 200, width: "100%", borderRadius: 14, overflow: "hidden",
    marginBottom: 24, borderWidth: 1, borderColor: "#2A2A2A",
    backgroundColor: "#1E1E1E", position: "relative",
  },
  mapOverlay: {
    position: "absolute", bottom: 10, right: 10,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: 16,
  },
  mapOverlayText: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  sectionTitle: { color: "#FFF", fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  card: {
    backgroundColor: "#1E1E1E", borderRadius: 14,
    padding: 16, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: "#00C853",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardName: { color: "#FFF", fontSize: 15, fontWeight: "bold", flex: 1 },
  badge: {
    backgroundColor: "#00C85322", borderRadius: 6, paddingHorizontal: 8,
    paddingVertical: 3, borderWidth: 1, borderColor: "#00C85366",
  },
  badgeText: { color: "#00C853", fontSize: 10, fontWeight: "bold" },
  stats: { flexDirection: "row" },
  statCol: { flex: 1, alignItems: "center" },
  statLabel: { color: "#666", fontSize: 10, marginBottom: 4 },
  statValue: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
  cloneBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#00C853", marginHorizontal: 20, marginTop: 24,
    padding: 18, borderRadius: 30, gap: 10,
  },
  cloneBtnText: { color: "#000", fontWeight: "bold", fontSize: 15 },
});
