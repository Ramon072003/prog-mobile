import { SQLiteExerciseRepository } from "../SQLiteExerciseRepository";
import { Exercise } from "../../../domain/entities/Exercise";
import { getDatabase } from "../../database/sqlite";

const mockDb = {
  getAllAsync: jest.fn(),
  runAsync: jest.fn(),
  getFirstAsync: jest.fn(),
};

jest.mock("../../database/sqlite");

describe("SQLiteExerciseRepository", () => {
  let repo: SQLiteExerciseRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    (getDatabase as jest.Mock).mockResolvedValue(mockDb);
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
