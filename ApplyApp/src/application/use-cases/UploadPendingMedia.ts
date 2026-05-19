import { IWorkoutExerciseRepository } from "../../domain/repositories/IWorkoutExerciseRepository";
import { IMediaService } from "../../infrastructure/services/MediaService";

export class UploadPendingMedia {
  constructor(
    private workoutExerciseRepo: IWorkoutExerciseRepository,
    private mediaService: IMediaService
  ) {}

  async execute(): Promise<void> {
    const pending = await this.workoutExerciseRepo.getPendingMediaSync();

    for (const we of pending) {
      try {
        const localUri = we.media_url;
        if (!localUri) continue;

        const fileName = `workouts/${we.workout_id}/${we.id}.jpg`;
        const publicUrl = await this.mediaService.uploadToSupabase(localUri, fileName);

        if (publicUrl) {
          we.setMediaUploaded(publicUrl);
          await this.workoutExerciseRepo.update(we);
        }
      } catch (error) {
        console.error(`[UploadPendingMedia] Falha no upload do exercício ${we.id}:`, error);
      }
    }
  }
}
