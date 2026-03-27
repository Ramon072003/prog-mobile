import * as FileSystem from "expo-file-system";
import { supabase } from "../api/supabase";
import { decode } from "base64-arraybuffer";

export interface IMediaService {
  saveLocal(uri: string): Promise<string>;
  uploadToSupabase(localUri: string, fileName: string): Promise<string | null>;
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
}
