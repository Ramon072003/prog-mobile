import { Exercise } from "../../domain/entities/Exercise";
import { IExerciseRepository } from "../../domain/repositories/IExerciseRepository";
import { getDatabase } from "../database/sqlite";

export class SQLiteExerciseRepository implements IExerciseRepository {
  async findAll(): Promise<Exercise[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync<any>("SELECT * FROM exercises ORDER BY name ASC");
    return results.map(row => new Exercise(row));
  }

  async saveAll(exercises: Exercise[]): Promise<void> {
    const db = await getDatabase();
    for (const exercise of exercises) {
      await db.runAsync(
        "INSERT OR REPLACE INTO exercises (id, name, muscle_group, created_at) VALUES (?, ?, ?, ?)",
        [exercise.id, exercise.name, exercise.muscle_group, exercise.created_at || new Date().toISOString()]
      );
    }
  }

  async findById(id: string): Promise<Exercise | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>("SELECT * FROM exercises WHERE id = ?", [id]);
    return row ? new Exercise(row) : null;
  }
}
