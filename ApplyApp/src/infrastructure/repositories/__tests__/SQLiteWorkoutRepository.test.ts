import { SQLiteWorkoutRepository } from "../SQLiteWorkoutRepository";
import { Workout, WorkoutStatus, SyncStatus } from "../../../domain/entities/Workout";
import * as SQLite from "expo-sqlite";

jest.mock("expo-sqlite");

describe("SQLiteWorkoutRepository", () => {
  let repo: SQLiteWorkoutRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      getAllAsync: jest.fn(),
      runAsync: jest.fn(),
      getFirstAsync: jest.fn(),
    };
    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb);
    repo = new SQLiteWorkoutRepository();
  });

  it("should save a workout", async () => {
    const workout = new Workout({ id: "w1", user_id: "u1", date: "2024-03-27", status: WorkoutStatus.ACTIVE, sync_status: SyncStatus.PENDING });
    
    await repo.save(workout);

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO workouts"),
      expect.arrayContaining(["w1", "u1", "2024-03-27", "active", "pending"])
    );
  });

  it("should find active workout", async () => {
    mockDb.getFirstAsync.mockResolvedValue({ id: "w1", user_id: "u1", date: "2024-03-27", status: "active", sync_status: "pending" });

    const result = await repo.findActiveByUserId("u1");

    expect(result?.id).toBe("w1");
    expect(mockDb.getFirstAsync).toHaveBeenCalledWith(expect.stringContaining("status = 'active'"), ["u1"]);
  });
});
