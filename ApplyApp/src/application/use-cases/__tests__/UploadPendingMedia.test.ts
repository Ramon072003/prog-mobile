import { UploadPendingMedia } from "../UploadPendingMedia";
import { WorkoutExercise, MediaSyncStatus } from "../../../domain/entities/WorkoutExercise";
import { IWorkoutExerciseRepository } from "../../../domain/repositories/IWorkoutExerciseRepository";
import { IMediaService } from "../../../infrastructure/services/MediaService";

function makeWorkoutExercise(overrides: Partial<{ id: string; media_url: string; media_sync: MediaSyncStatus }> = {}) {
  return new WorkoutExercise({
    id: overrides.id ?? "we-1",
    workout_id: "w-1",
    exercise_id: "ex-1",
    sets: 3,
    reps: 10,
    weight: 20,
    media_url: overrides.media_url ?? "file:///local/photo.jpg",
    media_sync: overrides.media_sync ?? MediaSyncStatus.PENDING,
  });
}

describe("UploadPendingMedia", () => {
  let weRepo: jest.Mocked<IWorkoutExerciseRepository>;
  let mediaService: jest.Mocked<IMediaService>;
  let useCase: UploadPendingMedia;

  beforeEach(() => {
    weRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByWorkoutId: jest.fn(),
      delete: jest.fn(),
      getPendingMediaSync: jest.fn(),
      update: jest.fn(),
    };
    mediaService = {
      saveLocal: jest.fn(),
      uploadToSupabase: jest.fn(),
      uploadAvatar: jest.fn(),
    };
    useCase = new UploadPendingMedia(weRepo, mediaService);
  });

  it("should upload pending media and mark as uploaded", async () => {
    const we = makeWorkoutExercise();
    weRepo.getPendingMediaSync.mockResolvedValue([we]);
    mediaService.uploadToSupabase.mockResolvedValue("https://storage.com/photo.jpg");

    await useCase.execute();

    expect(mediaService.uploadToSupabase).toHaveBeenCalledWith(
      "file:///local/photo.jpg",
      "workouts/w-1/we-1.jpg"
    );
    expect(we.media_sync).toBe(MediaSyncStatus.UPLOADED);
    expect(we.media_url).toBe("https://storage.com/photo.jpg");
    expect(weRepo.update).toHaveBeenCalledWith(we);
  });

  it("should skip if upload returns null", async () => {
    const we = makeWorkoutExercise();
    weRepo.getPendingMediaSync.mockResolvedValue([we]);
    mediaService.uploadToSupabase.mockResolvedValue(null);

    await useCase.execute();

    expect(we.media_sync).toBe(MediaSyncStatus.PENDING);
    expect(weRepo.update).not.toHaveBeenCalled();
  });

  it("should skip exercise without media_url", async () => {
    const we = new WorkoutExercise({
      id: "we-1",
      workout_id: "w-1",
      exercise_id: "ex-1",
      sets: 3,
      reps: 10,
      weight: 20,
      media_sync: MediaSyncStatus.PENDING,
    });
    weRepo.getPendingMediaSync.mockResolvedValue([we]);

    await useCase.execute();

    expect(mediaService.uploadToSupabase).not.toHaveBeenCalled();
    expect(weRepo.update).not.toHaveBeenCalled();
  });

  it("should continue with remaining items if one fails", async () => {
    const we1 = makeWorkoutExercise({ id: "we-1" });
    const we2 = makeWorkoutExercise({ id: "we-2" });
    weRepo.getPendingMediaSync.mockResolvedValue([we1, we2]);
    mediaService.uploadToSupabase
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce("https://storage.com/photo2.jpg");

    await useCase.execute();

    expect(we1.media_sync).toBe(MediaSyncStatus.PENDING);
    expect(we2.media_sync).toBe(MediaSyncStatus.UPLOADED);
    expect(weRepo.update).toHaveBeenCalledTimes(1);
    expect(weRepo.update).toHaveBeenCalledWith(we2);
  });

  it("should do nothing when no pending media exists", async () => {
    weRepo.getPendingMediaSync.mockResolvedValue([]);

    await useCase.execute();

    expect(mediaService.uploadToSupabase).not.toHaveBeenCalled();
    expect(weRepo.update).not.toHaveBeenCalled();
  });
});
