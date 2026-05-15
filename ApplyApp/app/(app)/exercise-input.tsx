import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CameraModal } from "../../src/presentation/components/CameraModal";
import { StepperInput } from "../../src/presentation/components/StepperInput";
import { useDI } from "../../src/presentation/contexts/DIContext";

export default function ExerciseInputScreen() {
  const {
    workoutId, exerciseId, exerciseName,
    editId, editSets, editReps, editWeight,
  } = useLocalSearchParams<{
    workoutId: string;
    exerciseId: string;
    exerciseName: string;
    editId?: string;
    editSets?: string;
    editReps?: string;
    editWeight?: string;
  }>();

  const isEditing = !!editId;

  const [sets, setSets] = useState(editSets ? parseInt(editSets) : 3);
  const [reps, setReps] = useState(editReps ? parseInt(editReps) : 10);
  const [weight, setWeight] = useState(editWeight ? parseFloat(editWeight) : 0);
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const {
    addExerciseToWorkout: addExerciseUC,
    updateWorkoutExercise: updateExerciseUC,
    mediaService,
  } = useDI();

  async function handleSave() {
    setLoading(true);
    try {
      let finalMediaUrl: string | undefined;
      if (mediaUri) {
        finalMediaUrl = await mediaService.saveLocal(mediaUri);
      }

      if (isEditing && editId) {
        await updateExerciseUC.execute({ id: editId, sets, reps, weight, media_url: finalMediaUrl });
      } else {
        await addExerciseUC.execute({ workout_id: workoutId, exercise_id: exerciseId, sets, reps, weight });
      }
      router.back();
    } catch (error: any) {
      Alert.alert("Erro ao salvar", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? "Editar Exercício" : "Registrar Performance"}</Text>
      </View>

      <Text style={styles.exerciseName}>{exerciseName}</Text>

      <StepperInput label="SÉRIES" value={sets} step={1} min={1} max={20} onChange={setSets} />
      <StepperInput label="REPETIÇÕES" value={reps} step={1} min={1} max={99} onChange={setReps} />
      <StepperInput label="CARGA" value={weight} step={2.5} min={0} max={500} unit="kg" onChange={setWeight} />

      <TouchableOpacity
        style={[styles.mediaButton, mediaUri && styles.mediaButtonActive]}
        onPress={() => setShowCamera(true)}
      >
        <Ionicons name={mediaUri ? "checkmark-circle" : "camera"} size={22} color={mediaUri ? "#000" : "#00C853"} />
        <Text style={[styles.mediaButtonText, mediaUri && { color: "#000" }]}>
          {mediaUri ? "FOTO CAPTURADA ✓" : "ADICIONAR FOTO (OPCIONAL)"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveButton, loading && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "Salvando..." : isEditing ? "ATUALIZAR" : "ADICIONAR AO TREINO"}
        </Text>
      </TouchableOpacity>

      <CameraModal
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={(uri) => { setMediaUri(uri); setShowCamera(false); }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20, paddingTop: 60 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  title: { color: "#FFF", fontSize: 18, fontWeight: "bold", marginLeft: 16 },
  exerciseName: {
    color: "#00C853", fontSize: 22, fontWeight: "bold",
    textAlign: "center", marginBottom: 32,
  },
  mediaButton: {
    borderWidth: 1, borderColor: "#00C853",
    padding: 14, borderRadius: 12,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginTop: 4, marginBottom: 16, gap: 10,
  },
  mediaButtonActive: { backgroundColor: "#00C853" },
  mediaButtonText: { color: "#00C853", fontWeight: "bold" },
  saveButton: {
    backgroundColor: "#00C853", padding: 18,
    borderRadius: 30, alignItems: "center",
  },
  saveButtonText: { color: "#000", fontWeight: "bold", fontSize: 16 },
});
