import { IExerciseRepository } from "../../domain/repositories/IExerciseRepository";

export class SyncExerciseList {
  constructor(
    private remoteRepo: IExerciseRepository,
    private localRepo: IExerciseRepository
  ) {}

  async execute(): Promise<void> {
    try {
      const remoteExercises = await this.remoteRepo.findAll();
      if (remoteExercises.length > 0) {
        await this.localRepo.saveAll(remoteExercises);
      }
    } catch (error) {
      console.error("Erro ao sincronizar catálogo de exercícios:", error);
      // Silencioso por ser background sync
    }
  }
}
