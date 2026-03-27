import { Workout, WorkoutStatus, SyncStatus } from "../../domain/entities/Workout";
import { IWorkoutRepository } from "../../domain/repositories/IWorkoutRepository";

export class CreateWorkout {
  constructor(private workoutRepo: IWorkoutRepository) {}

  async execute(userId: string): Promise<Workout> {
    const activeWorkout = await this.workoutRepo.findActiveByUserId(userId);
    if (activeWorkout) {
      return activeWorkout;
    }

    const newWorkout = new Workout({
      id: Math.random().toString(36).substr(2, 9),
      user_id: userId,
      date: new Date().toISOString().split("T")[0],
      status: WorkoutStatus.ACTIVE,
      sync_status: SyncStatus.PENDING,
    });

    await this.workoutRepo.save(newWorkout);
    return newWorkout;
  }
}
