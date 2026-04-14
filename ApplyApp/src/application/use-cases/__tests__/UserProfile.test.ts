import { UserProfile } from "../../../domain/entities/UserProfile";
import { IUserProfileRepository } from "../../../domain/repositories/IUserProfileRepository";
import { GetUserProfile } from "../GetUserProfile";

describe("UserProfile Entity", () => {
  it("should create a profile with a valid name", () => {
    const profile = new UserProfile({ id: "1", name: "Rafael" });
    expect(profile.name).toBe("Rafael");
  });

  it("should throw if name is too short", () => {
    expect(() => new UserProfile({ id: "1", name: "A" })).toThrow(
      "Nome deve ter pelo menos 2 caracteres."
    );
  });

  it("should throw if name is empty", () => {
    expect(() => new UserProfile({ id: "1", name: "" })).toThrow();
  });

  it("should trim whitespace from name", () => {
    const profile = new UserProfile({ id: "1", name: "  Rafael  " });
    expect(profile.name).toBe("Rafael");
  });

  it("should update name correctly", () => {
    const profile = new UserProfile({ id: "1", name: "Rafael" });
    profile.updateName("Carlos");
    expect(profile.name).toBe("Carlos");
  });

  it("should throw when updating with short name", () => {
    const profile = new UserProfile({ id: "1", name: "Rafael" });
    expect(() => profile.updateName("X")).toThrow();
  });
});

describe("GetUserProfile Use Case", () => {
  let localRepo: jest.Mocked<IUserProfileRepository>;
  let remoteRepo: jest.Mocked<IUserProfileRepository>;
  let useCase: GetUserProfile;

  beforeEach(() => {
    localRepo = { save: jest.fn(), findByUserId: jest.fn(), update: jest.fn() };
    remoteRepo = { save: jest.fn(), findByUserId: jest.fn(), update: jest.fn() };
    useCase = new GetUserProfile(localRepo, remoteRepo);
  });

  it("should return local profile if exists", async () => {
    const profile = new UserProfile({ id: "u1", name: "Rafael" });
    localRepo.findByUserId.mockResolvedValue(profile);

    const result = await useCase.execute("u1");
    expect(result?.name).toBe("Rafael");
    expect(remoteRepo.findByUserId).not.toHaveBeenCalled();
  });

  it("should fetch remote if no local profile and persist locally", async () => {
    const profile = new UserProfile({ id: "u1", name: "Carlos" });
    localRepo.findByUserId.mockResolvedValue(null);
    remoteRepo.findByUserId.mockResolvedValue(profile);

    const result = await useCase.execute("u1");
    expect(result?.name).toBe("Carlos");
    expect(localRepo.save).toHaveBeenCalledWith(profile);
  });

  it("should return null if not found anywhere", async () => {
    localRepo.findByUserId.mockResolvedValue(null);
    remoteRepo.findByUserId.mockResolvedValue(null);

    const result = await useCase.execute("u1");
    expect(result).toBeNull();
  });
});
