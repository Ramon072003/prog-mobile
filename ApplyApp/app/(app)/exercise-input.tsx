import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SQLiteWorkoutExerciseRepository } from "../../src/infrastructure/repositories/SQLiteWorkoutExerciseRepository";
import { AddExerciseToWorkout } from "../../src/application/use-cases/AddExerciseToWorkout";
import { CameraModal } from "../../src/presentation/components/CameraModal";
import { MediaService } from "../../src/infrastructure/services/MediaService";

export default function ExerciseInputScreen() {
  const { workoutId, exerciseId, exerciseName } = useLocalSearchParams<{ 
    workoutId: string; 
    exerciseId: string;
    exerciseName: string;
  }>();
  
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("0");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const weRepo = new SQLiteWorkoutExerciseRepository();
  const addExerciseUC = new AddExerciseToWorkout(weRepo);
  const mediaService = new MediaService();

  async function handleSave() {
    if (!sets || !reps || !weight) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      let finalMediaUrl = undefined;
      if (mediaUri) {
        // Salva localmente primeiro (Offline-First)
        const localPath = await mediaService.saveLocal(mediaUri);
        finalMediaUrl = localPath;
        
        // O upload real seria feito em background pelo SyncWorker
        // Para este MVP, vamos apenas registrar o path local
      }

      await addExerciseUC.execute({
        workout_id: workoutId,
        exercise_id: exerciseId,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: parseFloat(weight)
      });
      router.dismiss(2); 
    } catch (error: any) {
      Alert.alert("Erro ao salvar", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Registrar Performance</Text>
      </View>

      <Text style={styles.exerciseName}>{exerciseName}</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Séries</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={sets}
          onChangeText={setSets}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Repetições</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={reps}
          onChangeText={setReps}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
      </View>

      <TouchableOpacity 
        style={[styles.mediaButton, mediaUri && styles.mediaButtonActive]} 
        onPress={() => setShowCamera(true)}
      >
        <Ionicons name={mediaUri ? "checkmark-circle" : "camera"} size={24} color={mediaUri ? "#000" : "#00C853"} />
        <Text style={[styles.mediaButtonText, mediaUri && { color: "#000" }]}>
          {mediaUri ? "FOTO CAPTURADA" : "ADICIONAR FOTO (OPCIONAL)"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.saveButton, loading && { opacity: 0.7 }]} 
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>ADICIONAR AO TREINO</Text>
      </TouchableOpacity>

      <CameraModal 
        visible={showCamera} 
        onClose={() => setShowCamera(false)} 
        onCapture={(uri) => {
          setMediaUri(uri);
          setShowCamera(false);
        }} 
      />
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
    marginBottom: 30,
  },
  title: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },
  exerciseName: {
    color: "#00C853",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#666",
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#FFF",
    padding: 15,
    borderRadius: 12,
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#333",
  },
  mediaButton: {
    borderWidth: 1,
    borderColor: "#00C853",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  mediaButtonActive: {
    backgroundColor: "#00C853",
  },
  mediaButtonText: {
    color: "#00C853",
    fontWeight: "bold",
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: "#00C853",
    padding: 18,
    borderRadius: 30,
    marginTop: 20,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});
