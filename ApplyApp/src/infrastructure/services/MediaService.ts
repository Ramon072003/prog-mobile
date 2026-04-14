import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "../api/supabase";
import { decode } from "base64-arraybuffer";

export interface IMediaService {
  saveLocal(uri: string): Promise<string>;
  uploadToSupabase(localUri: string, fileName: string): Promise<string | null>;
  uploadAvatar(localUri: string, userId: string): Promise<string | null>;
}

export class MediaService implements IMediaService {
  async saveLocal(uri: string): Promise<string> {
    const fileName = `${Date.now()}.jpg`;
    const dest = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  }

  async uploadToSupabase(localUri: string, fileName: string): Promise<string | null> {
    try {
      const base64 = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { data, error } = await supabase.storage
        .from("workout-media")
        .upload(fileName, decode(base64), {
          contentType: "image/jpeg",
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("workout-media")
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error("Erro no upload para o Supabase:", error);
      return null;
    }
  }

  async uploadAvatar(localUri: string, userId: string): Promise<string | null> {
    try {
      const base64 = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const path = `${userId}/avatar.jpg`;

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(path, decode(base64), {
          contentType: "image/jpeg",
          upsert: true, // sobrescreve o arquivo existente
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(data.path);

      // Cache-busting: força o reload da imagem após troca
      return `${publicUrl}?t=${Date.now()}`;
    } catch (error) {
      console.error("Erro no upload de avatar:", error);
      return null;
    }
  }
}
