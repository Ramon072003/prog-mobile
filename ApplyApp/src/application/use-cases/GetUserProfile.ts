import { IUserProfileRepository } from "../../domain/repositories/IUserProfileRepository";
import { UserProfile } from "../../domain/entities/UserProfile";

export class GetUserProfile {
  constructor(
    private localRepo: IUserProfileRepository,
    private remoteRepo: IUserProfileRepository
  ) {}

  async execute(userId: string): Promise<UserProfile | null> {
    // Offline-first: busca local primeiro
    const local = await this.localRepo.findByUserId(userId);
    if (local) return local;

    // Fallback: busca remoto e persiste localmente
    try {
      const remote = await this.remoteRepo.findByUserId(userId);
      if (remote) {
        await this.localRepo.save(remote);
        return remote;
      }
    } catch (error) {
      console.error("Falha ao buscar perfil remotamente:", error);
    }

    return null;
  }
}
