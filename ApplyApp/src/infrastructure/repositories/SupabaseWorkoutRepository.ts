import { Workout } from "../../domain/entities/Workout";
import { IWorkoutRepository } from "../../domain/repositories/IWorkoutRepository";
import { supabase } from "../api/supabase";

export class SupabaseWorkoutRepository implements IWorkoutRepository {
  async save(workout: Workout): Promise<void> {
    const data = workout.toJSON();
    const { error } = await supabase.from("workouts").upsert({
      id: data.id,
      user_id: data.user_id,
      date: data.date,
      status: data.status,
      latitude: data.latitude,
      longitude: data.longitude,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(`Erro ao salvar treino no Supabase: ${error.message}`);
  }

  async update(workout: Workout): Promise<void> {
    return this.save(workout);
  }

  async findById(id: string): Promise<Workout | null> {
    const { data, error } = await supabase.from("workouts").select("*").eq("id", id).single();
    if (error) return null;
    return new Workout(data);
  }

  async findActiveByUserId(userId: string): Promise<Workout | null> {
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (error) return null;
    return new Workout(data);
  }

  async findWeeklyByUserId(userId: string, startDate: string, endDate: string): Promise<Workout[]> {
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });
    if (error) throw new Error(`Erro ao buscar treinos semanais: ${error.message}`);
    return (data || []).map(row => new Workout(row));
  }

  async getPendingSync(): Promise<Workout[]> {
    throw new Error("Operação não suportada no SupabaseRepository.");
  }
}
