import { IUserProfileRepository } from "../../domain/repositories/IUserProfileRepository";
import { IMediaService } from "../../infrastructure/services/MediaService";

export class UpdateUserAvatar {
  constructor(
    private localRepo: IUserProfileRepository,
    private remoteRepo: IUserProfileRepository,
    private mediaService: IMediaService
  ) {}

  async execute(userId: string, imageUri: string): Promise<string | null> {
    // 1. Busca o perfil local
    const profile = await this.localRepo.findByUserId(userId);
    if (!profile) return null;

    // 2. Salva localmente PRIMEIRO (offline-first) com a URI local
    //    → usuário vê a foto imediatamente, mesmo sem internet
    profile.avatar_url = imageUri;
    profile.updated_at = new Date().toISOString();
    await this.localRepo.update(profile);

    // 3. Tenta fazer upload para o Supabase em background
    const publicUrl = await this.mediaService.uploadAvatar(imageUri, userId);

    if (publicUrl) {
      // 4. Upload bem-sucedido: substitui a URI local pela URL pública
      profile.avatar_url = publicUrl;
      profile.updated_at = new Date().toISOString();

      // Atualiza local com a URL remota e sincroniza com o Supabase
      await this.localRepo.update(profile);
      try {
        await this.remoteRepo.update(profile);
      } catch {
        // Silencia erros de rede — sincronizará depois via SyncWorker
      }

      return publicUrl;
    }

    // 5. Offline ou falha no upload: retorna a URI local
    //    A imagem já está salva no SQLite e será exibida localmente
    return imageUri;
  }
}
