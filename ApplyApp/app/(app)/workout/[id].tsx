import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
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
  const [mapScrollEnabled, setMapScrollEnabled] = useState(true);
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
    <ScrollView style={styles.container} scrollEnabled={mapScrollEnabled} nestedScrollEnabled>
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
          <View
            style={styles.mapWrapper}
            onTouchStart={() => setMapScrollEnabled(false)}
            onTouchEnd={() => setMapScrollEnabled(true)}
            onTouchCancel={() => setMapScrollEnabled(true)}
          >
            <MapView
              provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
              style={styles.mapContainer}
              initialRegion={{
                latitude: workout.latitude,
                longitude: workout.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              scrollEnabled
              zoomEnabled
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: workout.latitude,
                  longitude: workout.longitude,
                }}
                title="Local do treino"
              />
            </MapView>
          </View>
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
  mapWrapper: {
    marginBottom: 24, position: "relative",
  },
  mapContainer: {
    height: 250, width: "100%", borderRadius: 14, overflow: "hidden",
    borderWidth: 1, borderColor: "#2A2A2A", backgroundColor: "#1E1E1E",
  },
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
