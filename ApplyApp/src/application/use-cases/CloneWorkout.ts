import { IWorkoutRepository } from "../../domain/repositories/IWorkoutRepository";
import { IWorkoutExerciseRepository } from "../../domain/repositories/IWorkoutExerciseRepository";
import { Workout, WorkoutStatus, SyncStatus } from "../../domain/entities/Workout";
import { WorkoutExercise, MediaSyncStatus } from "../../domain/entities/WorkoutExercise";
import { generateUUID } from "../../infrastructure/utils/generateUUID";

export class CloneWorkout {
  constructor(
    private workoutRepo: IWorkoutRepository,
    private weRepo: IWorkoutExerciseRepository
  ) {}

  async execute(sourceWorkoutId: string, userId: string): Promise<Workout> {
    const sourceExercises = await this.weRepo.findByWorkoutId(sourceWorkoutId);

    const newWorkout = new Workout({
      id: generateUUID(),
      user_id: userId,
      date: new Date().toISOString().split("T")[0],
      status: WorkoutStatus.ACTIVE,
      sync_status: SyncStatus.PENDING,
    });

    await this.workoutRepo.save(newWorkout);

    for (const we of sourceExercises) {
      const cloned = new WorkoutExercise({
        id: generateUUID(),
        workout_id: newWorkout.id,
        exercise_id: we.exercise_id,
        sets: we.sets,
        reps: we.reps,
        weight: we.weight,
        media_sync: MediaSyncStatus.PENDING,
      });
      await this.weRepo.save(cloned);
    }

    return newWorkout;
  }
}
