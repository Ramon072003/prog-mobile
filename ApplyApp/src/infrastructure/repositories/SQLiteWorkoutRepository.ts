import { Workout } from "../../domain/entities/Workout";
import { IWorkoutRepository } from "../../domain/repositories/IWorkoutRepository";
import { getDatabase } from "../database/sqlite";

export class SQLiteWorkoutRepository implements IWorkoutRepository {
  async save(workout: Workout): Promise<void> {
    const db = await getDatabase();
    const data = workout.toJSON();
    await db.runAsync(
      "INSERT INTO workouts (id, user_id, date, status, sync_status, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [data.id, data.user_id, data.date, data.status, data.sync_status, data.latitude || null, data.longitude || null]
    );
  }

  async update(workout: Workout): Promise<void> {
    const db = await getDatabase();
    const data = workout.toJSON();
    await db.runAsync(
      "UPDATE workouts SET status = ?, sync_status = ?, latitude = ?, longitude = ?, updated_at = ? WHERE id = ?",
      [data.status, data.sync_status, data.latitude || null, data.longitude || null, new Date().toISOString(), data.id]
    );
  }

  async findById(id: string): Promise<Workout | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>("SELECT * FROM workouts WHERE id = ?", [id]);
    return row ? new Workout(row) : null;
  }

  async findActiveByUserId(userId: string): Promise<Workout | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      "SELECT * FROM workouts WHERE user_id = ? AND status = 'active' LIMIT 1",
      [userId]
    );
    return row ? new Workout(row) : null;
  }

  async findWeeklyByUserId(userId: string, startDate: string, endDate: string): Promise<Workout[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      "SELECT * FROM workouts WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC",
      [userId, startDate, endDate]
    );
    return rows.map(row => new Workout(row));
  }

  async getPendingSync(): Promise<Workout[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>("SELECT * FROM workouts WHERE sync_status = 'pending'");
    return rows.map(row => new Workout(row));
  }
}
