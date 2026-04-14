import { UserProfile } from "../entities/UserProfile";

export interface IUserProfileRepository {
  save(profile: UserProfile): Promise<void>;
  findByUserId(userId: string): Promise<UserProfile | null>;
  update(profile: UserProfile): Promise<void>;
}
