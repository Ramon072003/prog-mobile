import { UserProfile } from "../../domain/entities/UserProfile";
import { IUserProfileRepository } from "../../domain/repositories/IUserProfileRepository";
import { supabase } from "../api/supabase";

export class SupabaseUserProfileRepository implements IUserProfileRepository {
  async save(profile: UserProfile): Promise<void> {
    const data = profile.toJSON();
    const { error } = await supabase.from("user_profiles").upsert({
      id: data.id,
      name: data.name,
      avatar_url: data.avatar_url ?? null,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(`Erro ao salvar perfil no Supabase: ${error.message}`);
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error || !data) return null;
    return new UserProfile(data);
  }

  async update(profile: UserProfile): Promise<void> {
    return this.save(profile);
  }
}
