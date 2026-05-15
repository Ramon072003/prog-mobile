import { SyncWorkouts } from "./SyncWorkouts";
import { SyncExerciseList } from "./SyncExerciseList";

export class SyncOrchestrator {
  constructor(
    private syncWorkouts: SyncWorkouts,
    private syncExercises: SyncExerciseList
  ) {}

  async execute(): Promise<void> {
    await Promise.all([
      this.syncWorkouts.execute(),
      this.syncExercises.execute(),
    ]);
  }
}
