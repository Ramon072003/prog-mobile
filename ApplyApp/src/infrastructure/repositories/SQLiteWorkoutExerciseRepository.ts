import { WorkoutExercise } from "../../domain/entities/WorkoutExercise";
import { IWorkoutExerciseRepository } from "../../domain/repositories/IWorkoutExerciseRepository";
import { getDatabase } from "../database/sqlite";

export class SQLiteWorkoutExerciseRepository implements IWorkoutExerciseRepository {
  async save(we: WorkoutExercise): Promise<void> {
    const db = await getDatabase();
    const data = we.toJSON();
    await db.runAsync(
      "INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, weight, media_url, media_sync) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [data.id, data.workout_id, data.exercise_id, data.sets, data.reps, data.weight, data.media_url || null, data.media_sync]
    );
  }

  async findByWorkoutId(workoutId: string): Promise<WorkoutExercise[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      "SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY created_at ASC",
      [workoutId]
    );
    return rows.map(row => new WorkoutExercise(row));
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM workout_exercises WHERE id = ?", [id]);
  }

  async getPendingMediaSync(): Promise<WorkoutExercise[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>("SELECT * FROM workout_exercises WHERE media_sync = 'pending' AND media_url IS NOT NULL");
    return rows.map(row => new WorkoutExercise(row));
  }

  async update(we: WorkoutExercise): Promise<void> {
    const db = await getDatabase();
    const data = we.toJSON();
    await db.runAsync(
      "UPDATE workout_exercises SET media_url = ?, media_sync = ? WHERE id = ?",
      [data.media_url ?? null, data.media_sync, data.id]
    );
  }
}
