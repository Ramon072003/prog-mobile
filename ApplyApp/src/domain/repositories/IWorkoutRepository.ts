import { Workout } from "../entities/Workout";

export interface IWorkoutRepository {
  save(workout: Workout): Promise<void>;
  update(workout: Workout): Promise<void>;
  findById(id: string): Promise<Workout | null>;
  findActiveByUserId(userId: string): Promise<Workout | null>;
  findWeeklyByUserId(userId: string, startDate: string, endDate: string): Promise<Workout[]>;
  getPendingSync(): Promise<Workout[]>;
}
