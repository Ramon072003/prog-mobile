import { CreateWorkout } from "../CreateWorkout";
import { IWorkoutRepository } from "../../../domain/repositories/IWorkoutRepository";
import { Workout, WorkoutStatus } from "../../../domain/entities/Workout";

describe("CreateWorkout Use Case", () => {
  let workoutRepo: jest.Mocked<IWorkoutRepository>;
  let useCase: CreateWorkout;

  beforeEach(() => {
    workoutRepo = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findActiveByUserId: jest.fn(),
      findWeeklyByUserId: jest.fn(),
      getPendingSync: jest.fn(),
    };
    useCase = new CreateWorkout(workoutRepo);
  });

  it("should create a new workout if none is active", async () => {
    workoutRepo.findActiveByUserId.mockResolvedValue(null);

    const workout = await useCase.execute("user123");

    expect(workout.user_id).toBe("user123");
    expect(workout.status).toBe(WorkoutStatus.ACTIVE);
    expect(workoutRepo.save).toHaveBeenCalled();
  });

  it("should return existing active workout", async () => {
    const existing = new Workout({ id: "1", user_id: "user123", date: "2024-03-27", status: WorkoutStatus.ACTIVE, sync_status: "pending" as any });
    workoutRepo.findActiveByUserId.mockResolvedValue(existing);

    const workout = await useCase.execute("user123");

    expect(workout.id).toBe("1");
    expect(workoutRepo.save).not.toHaveBeenCalled();
  });
});
