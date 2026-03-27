import { Exercise } from "../entities/Exercise";

export interface IExerciseRepository {
  findAll(): Promise<Exercise[]>;
  saveAll(exercises: Exercise[]): Promise<void>;
  findById(id: string): Promise<Exercise | null>;
}
