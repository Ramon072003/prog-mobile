import { useEffect, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import { SyncWorkouts } from "../use-cases/SyncWorkouts";
import { SyncExerciseList } from "../use-cases/SyncExerciseList";
import { SQLiteWorkoutRepository } from "../../infrastructure/repositories/SQLiteWorkoutRepository";
import { SQLiteWorkoutExerciseRepository } from "../../infrastructure/repositories/SQLiteWorkoutExerciseRepository";
import { SQLiteExerciseRepository } from "../../infrastructure/repositories/SQLiteExerciseRepository";
import { SupabaseWorkoutRepository } from "../../infrastructure/repositories/SupabaseWorkoutRepository";
import { SupabaseWorkoutExerciseRepository } from "../../infrastructure/repositories/SupabaseWorkoutExerciseRepository";
import { SupabaseExerciseRepository } from "../../infrastructure/repositories/SupabaseExerciseRepository";

const SYNC_INTERVAL_MS = 30_000;

export function useSyncWorker(dbReady: boolean = false) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isOnline = useRef(false);

  const localWorkoutRepo = new SQLiteWorkoutRepository();
  const localWERepo = new SQLiteWorkoutExerciseRepository();
  const localExerciseRepo = new SQLiteExerciseRepository();
  const remoteWorkoutRepo = new SupabaseWorkoutRepository();
  const remoteWERepo = new SupabaseWorkoutExerciseRepository();
  const remoteExerciseRepo = new SupabaseExerciseRepository();

  const syncWorkoutsUC = new SyncWorkouts(localWorkoutRepo, localWERepo, remoteWorkoutRepo, remoteWERepo);
  const syncExercisesUC = new SyncExerciseList(remoteExerciseRepo, localExerciseRepo);

  async function runSync() {
    if (!isOnline.current) return;
    try {
      await Promise.all([
        syncWorkoutsUC.execute(),
        syncExercisesUC.execute(),
      ]);
    } catch {
      // Falha silenciosa — retry em 30s
    }
  }

  useEffect(() => {
    if (!dbReady) return;

    const unsubscribe = NetInfo.addEventListener(state => {
      isOnline.current = !!(state.isConnected && state.isInternetReachable);
      if (isOnline.current) runSync(); // Sync imediato ao reconectar
    });

    timerRef.current = setInterval(runSync, SYNC_INTERVAL_MS);

    return () => {
      unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [dbReady]);
}
