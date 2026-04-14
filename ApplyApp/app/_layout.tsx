import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { supabase, isSupabaseConfigured } from "../src/infrastructure/api/supabase";
import { Session } from "@supabase/supabase-js";
import { useSyncWorker } from "../src/application/use-cases/useSyncWorker";
import { initializeDatabase } from "../src/infrastructure/database/sqlite";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useSyncWorker(dbReady);

  useEffect(() => {
    initializeDatabase()
      .then(() => setDbReady(true))
      .catch((err) => console.error("Erro ao inicializar banco:", err));
  }, []);

  useEffect(() => {
    if (!dbReady) return;

    if (!isSupabaseConfigured) {
      setInitialized(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    }).catch(() => {
      setInitialized(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [dbReady]);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      // Not logged in, and not in auth group -> redirect to login
      router.replace("/(auth)");
    } else if (session && inAuthGroup) {
      // Logged in, and in auth group -> redirect to home
      router.replace("/(app)");
    }
  }, [session, initialized, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}
