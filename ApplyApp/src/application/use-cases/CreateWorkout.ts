import { Workout, WorkoutStatus, SyncStatus } from "../../domain/entities/Workout";
import { IWorkoutRepository } from "../../domain/repositories/IWorkoutRepository";
import { generateUUID } from "../../infrastructure/utils/generateUUID";

export class CreateWorkout {
  constructor(private workoutRepo: IWorkoutRepository) {}

  async execute(userId: string): Promise<Workout> {
    const activeWorkout = await this.workoutRepo.findActiveByUserId(userId);
    if (activeWorkout) {
      return activeWorkout;
    }

    const newWorkout = new Workout({
      id: generateUUID(),
      user_id: userId,
      date: new Date().toISOString().split("T")[0],
      status: WorkoutStatus.ACTIVE,
      sync_status: SyncStatus.PENDING,
    });

    await this.workoutRepo.save(newWorkout);
    return newWorkout;
  }
}
