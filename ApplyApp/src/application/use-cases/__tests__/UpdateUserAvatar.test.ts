import { UserProfile } from "../../../domain/entities/UserProfile";
import { IUserProfileRepository } from "../../../domain/repositories/IUserProfileRepository";
import { IMediaService } from "../../../infrastructure/services/MediaService";
import { UpdateUserAvatar } from "../UpdateUserAvatar";

const makeProfile = (overrides = {}) =>
  new UserProfile({ id: "user-1", name: "Rafael", ...overrides });

describe("UpdateUserAvatar Use Case", () => {
  let localRepo: jest.Mocked<IUserProfileRepository>;
  let remoteRepo: jest.Mocked<IUserProfileRepository>;
  let mediaService: jest.Mocked<IMediaService>;
  let useCase: UpdateUserAvatar;

  const LOCAL_URI = "file:///local/photo.jpg";
  const PUBLIC_URL = "https://supabase.co/avatars/user-1/avatar.jpg?t=123";

  beforeEach(() => {
    localRepo = { save: jest.fn(), findByUserId: jest.fn(), update: jest.fn() };
    remoteRepo = { save: jest.fn(), findByUserId: jest.fn(), update: jest.fn() };
    mediaService = { saveLocal: jest.fn(), uploadToSupabase: jest.fn(), uploadAvatar: jest.fn() };
    useCase = new UpdateUserAvatar(localRepo, remoteRepo, mediaService);
  });

  it("deve salvar a URI local no SQLite ANTES de tentar o upload (offline-first)", async () => {
    const profile = makeProfile();
    localRepo.findByUserId.mockResolvedValue(profile);

    // Upload demora — queremos confirmar que o local update acontece antes
    let localUpdateCalledBefore = false;
    mediaService.uploadAvatar.mockImplementation(async () => {
      // No momento em que o upload é chamado, o local update já deve ter acontecido
      localUpdateCalledBefore = (localRepo.update as jest.Mock).mock.calls.length > 0;
      return PUBLIC_URL;
    });

    await useCase.execute("user-1", LOCAL_URI);

    expect(localUpdateCalledBefore).toBe(true);
  });

  it("deve atualizar SQLite com URL pública e sincronizar remoto após upload bem-sucedido", async () => {
    const profile = makeProfile();
    localRepo.findByUserId.mockResolvedValue(profile);
    mediaService.uploadAvatar.mockResolvedValue(PUBLIC_URL);

    const result = await useCase.execute("user-1", LOCAL_URI);

    // localRepo.update chamado 2x: uma com URI local, outra com URL pública
    expect(localRepo.update).toHaveBeenCalledTimes(2);
    expect(remoteRepo.update).toHaveBeenCalledTimes(1);
    expect(result).toBe(PUBLIC_URL);

    const lastCall = (localRepo.update as jest.Mock).mock.calls[1][0] as UserProfile;
    expect(lastCall.avatar_url).toBe(PUBLIC_URL);
  });

  it("deve retornar a URI local (não null) quando o upload falhar — imagem continua visível", async () => {
    const profile = makeProfile();
    localRepo.findByUserId.mockResolvedValue(profile);
    mediaService.uploadAvatar.mockResolvedValue(null);

    const result = await useCase.execute("user-1", LOCAL_URI);

    // Ainda salva localmente na primeira chamada
    expect(localRepo.update).toHaveBeenCalledTimes(1);
    // remoteRepo NÃO deve ter sido chamado
    expect(remoteRepo.update).not.toHaveBeenCalled();
    // Retorna a URI local para que o usuário continue vendo a foto
    expect(result).toBe(LOCAL_URI);
  });

  it("deve silenciar erro do remoteRepo e ainda retornar a URL pública", async () => {
    const profile = makeProfile();
    localRepo.findByUserId.mockResolvedValue(profile);
    mediaService.uploadAvatar.mockResolvedValue(PUBLIC_URL);
    remoteRepo.update.mockRejectedValue(new Error("Network error"));

    const result = await useCase.execute("user-1", LOCAL_URI);

    expect(result).toBe(PUBLIC_URL);
  });

  it("deve retornar null se o perfil não existir localmente", async () => {
    localRepo.findByUserId.mockResolvedValue(null);

    const result = await useCase.execute("user-1", LOCAL_URI);

    expect(result).toBeNull();
    expect(mediaService.uploadAvatar).not.toHaveBeenCalled();
  });
});
