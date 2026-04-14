import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = isValidUrl(supabaseUrl);

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️ EXPO_PUBLIC_SUPABASE_URL não configurada. " +
    "Edite o arquivo .env com a URL do seu projeto Supabase."
  );
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://placeholder.supabase.co",
  isSupabaseConfigured ? supabaseAnonKey : "placeholder"
);
