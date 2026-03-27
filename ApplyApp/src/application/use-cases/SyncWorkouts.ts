import { IWorkoutRepository } from "../../domain/repositories/IWorkoutRepository";
import { IWorkoutExerciseRepository } from "../../domain/repositories/IWorkoutExerciseRepository";

export class SyncWorkouts {
  constructor(
    private localWorkoutRepo: IWorkoutRepository,
    private localWERepo: IWorkoutExerciseRepository,
    private remoteWorkoutRepo: IWorkoutRepository,
    private remoteWERepo: IWorkoutExerciseRepository
  ) {}

  async execute(): Promise<void> {
    const pendingWorkouts = await this.localWorkoutRepo.getPendingSync();

    for (const workout of pendingWorkouts) {
      try {
        // 1. Sincronizar o Treino
        await this.remoteWorkoutRepo.save(workout);

        // 2. Sincronizar todos os exercícios vinculados a este treino
        const exercises = await this.localWERepo.findByWorkoutId(workout.id);
        for (const we of exercises) {
          await this.remoteWERepo.save(we);
        }

        // 3. Marcar como sincronizado localmente
        workout.markSynced();
        await this.localWorkoutRepo.update(workout);
      } catch (error) {
        console.error(`Falha ao sincronizar treino ${workout.id}:`, error);
      }
    }
  }
}
