import { IWorkoutRepository } from "../../domain/repositories/IWorkoutRepository";

export class CompleteWorkout {
  constructor(private workoutRepo: IWorkoutRepository) {}

  async execute(workoutId: string, latitude?: number, longitude?: number): Promise<void> {
    const workout = await this.workoutRepo.findById(workoutId);
    if (!workout) throw new Error("Treino não encontrado.");

    workout.complete(latitude, longitude);
    await this.workoutRepo.update(workout);
  }
}
