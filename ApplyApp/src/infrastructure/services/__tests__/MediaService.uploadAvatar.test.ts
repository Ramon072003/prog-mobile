import { MediaService } from "../../services/MediaService";

// O supabase client é mockado via __mocks__/@supabase/supabase-js.ts
// O expo-file-system/legacy é mockado via __mocks__/expo-file-system.ts

// Mock manual do módulo legado do FileSystem
jest.mock("expo-file-system/legacy", () => ({
  readAsStringAsync: jest.fn().mockResolvedValue("base64encodedstring"),
  copyAsync: jest.fn().mockResolvedValue(undefined),
  documentDirectory: "file:///test-dir/",
  EncodingType: { Base64: "base64" },
}));

jest.mock("../../api/supabase", () => ({
  supabase: {
    storage: {
      from: jest.fn((bucket: string) => ({
        upload: jest.fn().mockResolvedValue({
          data: { path: `${bucket}/user-1/avatar.jpg` },
          error: null,
        }),
        getPublicUrl: jest.fn((path: string) => ({
          data: { publicUrl: `https://test.supabase.co/storage/v1/object/public/${path}` },
        })),
      })),
    },
  },
}));

describe("MediaService.uploadAvatar", () => {
  let service: MediaService;

  beforeEach(() => {
    service = new MediaService();
    jest.clearAllMocks();
  });

  it("deve usar o bucket 'avatars' e o path correto {userId}/avatar.jpg", async () => {
    const { supabase } = require("../../api/supabase");
    await service.uploadAvatar("file:///local/photo.jpg", "user-1");
    expect(supabase.storage.from).toHaveBeenCalledWith("avatars");
    const storageBucket = supabase.storage.from.mock.results[0].value;
    expect(storageBucket.upload).toHaveBeenCalledWith(
      "user-1/avatar.jpg",
      expect.anything(),
      expect.objectContaining({ contentType: "image/jpeg", upsert: true })
    );
  });

  it("deve retornar uma URL pública válida com timestamp de cache-busting", async () => {
    const result = await service.uploadAvatar("file:///local/photo.jpg", "user-1");
    expect(result).toMatch(/^https:\/\/.+/);
    expect(result).toMatch(/\?t=\d+/);
  });

  it("deve retornar null se o upload falhar", async () => {
    const { supabase } = require("../../api/supabase");
    supabase.storage.from.mockReturnValueOnce({
      upload: jest.fn().mockResolvedValue({ data: null, error: new Error("Bucket not found") }),
      getPublicUrl: jest.fn(),
    });

    const result = await service.uploadAvatar("file:///local/photo.jpg", "user-1");
    expect(result).toBeNull();
  });
});
