import { SQLiteExerciseRepository } from "../SQLiteExerciseRepository";
import { Exercise } from "../../../domain/entities/Exercise";
import * as SQLite from "expo-sqlite";

jest.mock("expo-sqlite");

describe("SQLiteExerciseRepository", () => {
  let repo: SQLiteExerciseRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      getAllAsync: jest.fn(),
      runAsync: jest.fn(),
      getFirstAsync: jest.fn(),
    };
    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb);
    repo = new SQLiteExerciseRepository();
  });

  it("should find all exercises", async () => {
    mockDb.getAllAsync.mockResolvedValue([
      { id: "1", name: "Supino", muscle_group: "Peito" }
    ]);

    const results = await repo.findAll();

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Supino");
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(expect.stringContaining("SELECT * FROM exercises"));
  });

  it("should save exercises", async () => {
    const exercise = new Exercise({ id: "1", name: "Supino", muscle_group: "Peito" });
    
    await repo.saveAll([exercise]);

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("INSERT OR REPLACE INTO exercises"),
      expect.arrayContaining(["1", "Supino", "Peito"])
    );
  });
});
