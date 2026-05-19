import { SyncOrchestrator } from "../SyncOrchestrator";
import { SyncWorkouts } from "../SyncWorkouts";
import { SyncExerciseList } from "../SyncExerciseList";
import { UploadPendingMedia } from "../UploadPendingMedia";

describe("SyncOrchestrator", () => {
  let syncWorkouts: jest.Mocked<SyncWorkouts>;
  let syncExercises: jest.Mocked<SyncExerciseList>;
  let uploadPendingMedia: jest.Mocked<UploadPendingMedia>;
  let orchestrator: SyncOrchestrator;

  beforeEach(() => {
    syncWorkouts = { execute: jest.fn().mockResolvedValue(undefined) } as any;
    syncExercises = { execute: jest.fn().mockResolvedValue(undefined) } as any;
    uploadPendingMedia = { execute: jest.fn().mockResolvedValue(undefined) } as any;
    orchestrator = new SyncOrchestrator(syncWorkouts, syncExercises, uploadPendingMedia);
  });

  it("should execute all sync tasks", async () => {
    await orchestrator.execute();

    expect(syncWorkouts.execute).toHaveBeenCalledTimes(1);
    expect(syncExercises.execute).toHaveBeenCalledTimes(1);
    expect(uploadPendingMedia.execute).toHaveBeenCalledTimes(1);
  });

  it("should reject if any sync task fails", async () => {
    syncWorkouts.execute.mockRejectedValue(new Error("Sync failed"));

    await expect(orchestrator.execute()).rejects.toThrow("Sync failed");
  });
});
