import { Exercise } from "../../domain/entities/Exercise";
import { IExerciseRepository } from "../../domain/repositories/IExerciseRepository";
import { supabase } from "../api/supabase";

export class SupabaseExerciseRepository implements IExerciseRepository {
  async findAll(): Promise<Exercise[]> {
    const { data, error } = await supabase.from("exercises").select("*");
    if (error) throw new Error(`Falha ao buscar exercícios remotos: ${error.message}`);
    return (data || []).map(row => new Exercise(row));
  }

  async saveAll(exercises: Exercise[]): Promise<void> {
    throw new Error("Operação não suportada: O catálogo de exercícios é somente leitura no app.");
  }

  async findById(id: string): Promise<Exercise | null> {
    const { data, error } = await supabase.from("exercises").select("*").eq("id", id).single();
    if (error) return null;
    return new Exercise(data);
  }
}
