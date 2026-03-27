import { SyncExerciseList } from "../SyncExerciseList";
import { IExerciseRepository } from "../../../domain/repositories/IExerciseRepository";
import { Exercise } from "../../../domain/entities/Exercise";

describe("SyncExerciseList Use Case", () => {
  let remoteRepo: jest.Mocked<IExerciseRepository>;
  let localRepo: jest.Mocked<IExerciseRepository>;
  let useCase: SyncExerciseList;

  beforeEach(() => {
    remoteRepo = {
      findAll: jest.fn(),
      saveAll: jest.fn(),
      findById: jest.fn(),
    };
    localRepo = {
      findAll: jest.fn(),
      saveAll: jest.fn(),
      findById: jest.fn(),
    };
    useCase = new SyncExerciseList(remoteRepo, localRepo);
  });

  it("should fetch remote exercises and save them locally", async () => {
    const mockExercises = [
      new Exercise({ id: "1", name: "Supino", muscle_group: "Peito" })
    ];
    remoteRepo.findAll.mockResolvedValue(mockExercises);

    await useCase.execute();

    expect(remoteRepo.findAll).toHaveBeenCalled();
    expect(localRepo.saveAll).toHaveBeenCalledWith(mockExercises);
  });

  it("should not call local save if remote is empty", async () => {
    remoteRepo.findAll.mockResolvedValue([]);

    await useCase.execute();

    expect(localRepo.saveAll).not.toHaveBeenCalled();
  });

  it("should catch and log errors silently", async () => {
    console.error = jest.fn();
    remoteRepo.findAll.mockRejectedValue(new Error("Network Error"));

    await useCase.execute();

    expect(console.error).toHaveBeenCalled();
  });
});
