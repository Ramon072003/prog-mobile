import { WorkoutExercise, MediaSyncStatus } from "../../domain/entities/WorkoutExercise";
import { IWorkoutExerciseRepository } from "../../domain/repositories/IWorkoutExerciseRepository";

export interface AddExerciseProps {
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight: number;
}

export class AddExerciseToWorkout {
  constructor(private weRepo: IWorkoutExerciseRepository) {}

  async execute(props: AddExerciseProps): Promise<WorkoutExercise> {
    const workoutExercise = new WorkoutExercise({
      id: Math.random().toString(36).substr(2, 9),
      ...props,
      media_sync: MediaSyncStatus.PENDING,
    });

    await this.weRepo.save(workoutExercise);
    return workoutExercise;
  }
}
