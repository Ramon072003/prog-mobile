import { WorkoutExercise } from "../../domain/entities/WorkoutExercise";
import { IWorkoutExerciseRepository } from "../../domain/repositories/IWorkoutExerciseRepository";
import { supabase } from "../api/supabase";

export class SupabaseWorkoutExerciseRepository implements IWorkoutExerciseRepository {
  async save(we: WorkoutExercise): Promise<void> {
    const data = we.toJSON();
    const { error } = await supabase.from("workout_exercises").upsert({
      id: data.id,
      workout_id: data.workout_id,
      exercise_id: data.exercise_id,
      sets: data.sets,
      reps: data.reps,
      weight: data.weight,
      media_url: data.media_url,
    });
    if (error) throw new Error(`Erro ao salvar exercício do treino no Supabase: ${error.message}`);
  }

  async findByWorkoutId(workoutId: string): Promise<WorkoutExercise[]> {
    const { data, error } = await supabase
      .from("workout_exercises")
      .select("*")
      .eq("workout_id", workoutId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(`Erro ao buscar exercícios do treino: ${error.message}`);
    return (data || []).map(row => new WorkoutExercise(row));
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("workout_exercises").delete().eq("id", id);
    if (error) throw new Error(`Erro ao deletar exercício no Supabase: ${error.message}`);
  }

  async getPendingMediaSync(): Promise<WorkoutExercise[]> {
    throw new Error("Operação não suportada no SupabaseRepository.");
  }

  async update(we: WorkoutExercise): Promise<void> {
    return this.save(we);
  }
}
