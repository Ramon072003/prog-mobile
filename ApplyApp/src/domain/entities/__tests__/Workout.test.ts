import { Workout, WorkoutStatus, SyncStatus } from "../Workout";

describe("Workout Entity", () => {
  it("should create a valid workout with default statuses", () => {
    const workout = new Workout({
      id: "1",
      user_id: "user_123",
      date: "2024-03-27",
      status: WorkoutStatus.ACTIVE,
      sync_status: SyncStatus.PENDING,
    });

    expect(workout.status).toBe(WorkoutStatus.ACTIVE);
    expect(workout.sync_status).toBe(SyncStatus.PENDING);
  });

  it("should complete a workout with coordinates", () => {
    const workout = new Workout({
      id: "1",
      user_id: "user_123",
      date: "2024-03-27",
      status: WorkoutStatus.ACTIVE,
      sync_status: SyncStatus.PENDING,
    });

    workout.complete(-23.55052, -46.633308);

    expect(workout.status).toBe(WorkoutStatus.COMPLETED);
    expect(workout.latitude).toBe(-23.55052);
    expect(workout.longitude).toBe(-46.633308);
  });

  it("should mark a workout as synced", () => {
    const workout = new Workout({
      id: "1",
      user_id: "user_123",
      date: "2024-03-27",
      status: WorkoutStatus.COMPLETED,
      sync_status: SyncStatus.PENDING,
    });

    workout.markSynced();
    expect(workout.sync_status).toBe(SyncStatus.SYNCED);
  });
});
