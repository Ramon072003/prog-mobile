import { CompleteWorkout } from "../CompleteWorkout";
import { IWorkoutRepository } from "../../../domain/repositories/IWorkoutRepository";
import { Workout, WorkoutStatus } from "../../../domain/entities/Workout";

describe("CompleteWorkout Use Case", () => {
  let workoutRepo: jest.Mocked<IWorkoutRepository>;
  let useCase: CompleteWorkout;

  beforeEach(() => {
    workoutRepo = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findActiveByUserId: jest.fn(),
      findWeeklyByUserId: jest.fn(),
      getPendingSync: jest.fn(),
    };
    useCase = new CompleteWorkout(workoutRepo);
  });

  it("should complete an existing workout", async () => {
    const workout = new Workout({ id: "1", user_id: "user123", date: "2024-03-27", status: WorkoutStatus.ACTIVE, sync_status: "pending" as any });
    workoutRepo.findById.mockResolvedValue(workout);

    await useCase.execute("1", -23, -46);

    expect(workout.status).toBe(WorkoutStatus.COMPLETED);
    expect(workout.latitude).toBe(-23);
    expect(workoutRepo.update).toHaveBeenCalledWith(workout);
  });

  it("should throw error if workout not found", async () => {
    workoutRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute("invalid")).rejects.toThrow("Treino não encontrado.");
  });
});
