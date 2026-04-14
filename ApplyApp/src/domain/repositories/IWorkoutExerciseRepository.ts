import { WorkoutExercise } from "../entities/WorkoutExercise";

export interface IWorkoutExerciseRepository {
  save(workoutExercise: WorkoutExercise): Promise<void>;
  findById(id: string): Promise<WorkoutExercise | null>;
  findByWorkoutId(workoutId: string): Promise<WorkoutExercise[]>;
  delete(id: string): Promise<void>;
  getPendingMediaSync(): Promise<WorkoutExercise[]>;
  update(workoutExercise: WorkoutExercise): Promise<void>;
}
