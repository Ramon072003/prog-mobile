import { SyncWorkouts } from "../SyncWorkouts";
import { IWorkoutRepository } from "../../../domain/repositories/IWorkoutRepository";
import { IWorkoutExerciseRepository } from "../../../domain/repositories/IWorkoutExerciseRepository";
import { Workout, WorkoutStatus } from "../../../domain/entities/Workout";
import { WorkoutExercise } from "../../../domain/entities/WorkoutExercise";

describe("SyncWorkouts Use Case", () => {
  let localWorkoutRepo: jest.Mocked<IWorkoutRepository>;
  let localWERepo: jest.Mocked<IWorkoutExerciseRepository>;
  let remoteWorkoutRepo: jest.Mocked<IWorkoutRepository>;
  let remoteWERepo: jest.Mocked<IWorkoutExerciseRepository>;
  let useCase: SyncWorkouts;

  beforeEach(() => {
    localWorkoutRepo = { getPendingSync: jest.fn(), save: jest.fn(), update: jest.fn(), findById: jest.fn(), findActiveByUserId: jest.fn(), findWeeklyByUserId: jest.fn() };
    localWERepo = { findByWorkoutId: jest.fn(), save: jest.fn(), delete: jest.fn(), getPendingMediaSync: jest.fn(), update: jest.fn() };
    remoteWorkoutRepo = { save: jest.fn(), update: jest.fn(), findById: jest.fn(), findActiveByUserId: jest.fn(), findWeeklyByUserId: jest.fn(), getPendingSync: jest.fn() };
    remoteWERepo = { save: jest.fn(), findByWorkoutId: jest.fn(), delete: jest.fn(), getPendingMediaSync: jest.fn(), update: jest.fn() };
    
    useCase = new SyncWorkouts(localWorkoutRepo, localWERepo, remoteWorkoutRepo, remoteWERepo);
  });

  it("should sync pending workouts and their exercises", async () => {
    const workout = new Workout({ id: "w1", user_id: "u1", date: "2024-03-27", status: WorkoutStatus.COMPLETED, sync_status: "pending" as any });
    const exercise = new WorkoutExercise({ id: "we1", workout_id: "w1", exercise_id: "e1", sets: 3, reps: 10, weight: 60, media_sync: "pending" as any });

    localWorkoutRepo.getPendingSync.mockResolvedValue([workout]);
    localWERepo.findByWorkoutId.mockResolvedValue([exercise]);

    await useCase.execute();

    expect(remoteWorkoutRepo.save).toHaveBeenCalledWith(workout);
    expect(remoteWERepo.save).toHaveBeenCalledWith(exercise);
    expect(workout.sync_status).toBe("synced");
    expect(localWorkoutRepo.update).toHaveBeenCalledWith(workout);
  });
});
