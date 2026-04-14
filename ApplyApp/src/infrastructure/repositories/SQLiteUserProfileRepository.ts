import { UserProfile } from "../../domain/entities/UserProfile";
import { IUserProfileRepository } from "../../domain/repositories/IUserProfileRepository";
import { getDatabase } from "../database/sqlite";

export class SQLiteUserProfileRepository implements IUserProfileRepository {
  async save(profile: UserProfile): Promise<void> {
    const db = await getDatabase();
    const data = profile.toJSON();
    await db.runAsync(
      `INSERT OR REPLACE INTO user_profiles (id, name, avatar_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [data.id, data.name, data.avatar_url ?? null, data.created_at ?? null, data.updated_at ?? null]
    );
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      "SELECT * FROM user_profiles WHERE id = ?",
      [userId]
    );
    if (!row) return null;
    return new UserProfile(row);
  }

  async update(profile: UserProfile): Promise<void> {
    const db = await getDatabase();
    const data = profile.toJSON();
    await db.runAsync(
      "UPDATE user_profiles SET name = ?, avatar_url = ?, updated_at = ? WHERE id = ?",
      [data.name, data.avatar_url ?? null, new Date().toISOString(), data.id]
    );
  }
}
