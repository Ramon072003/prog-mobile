import { IWorkoutExerciseRepository } from "../../domain/repositories/IWorkoutExerciseRepository";

export class RemoveExerciseFromWorkout {
  constructor(private weRepo: IWorkoutExerciseRepository) {}

  async execute(workoutExerciseId: string): Promise<void> {
    await this.weRepo.delete(workoutExerciseId);
  }
}
