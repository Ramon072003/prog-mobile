import { SyncWorkouts } from "./SyncWorkouts";
import { SyncExerciseList } from "./SyncExerciseList";
import { UploadPendingMedia } from "./UploadPendingMedia";

export class SyncOrchestrator {
  constructor(
    private syncWorkouts: SyncWorkouts,
    private syncExercises: SyncExerciseList,
    private uploadPendingMedia: UploadPendingMedia
  ) {}

  async execute(): Promise<void> {
    await Promise.all([
      this.syncWorkouts.execute(),
      this.syncExercises.execute(),
      this.uploadPendingMedia.execute(),
    ]);
  }
}
