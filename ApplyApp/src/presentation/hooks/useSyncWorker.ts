import { useEffect, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import { SyncOrchestrator } from "../../application/use-cases/SyncOrchestrator";

const SYNC_INTERVAL_MS = 30_000;

export function useSyncWorker(
  dbReady: boolean,
  syncOrchestrator: SyncOrchestrator
) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isOnline = useRef(false);

  useEffect(() => {
    if (!dbReady) return;

    async function runSync() {
      if (!isOnline.current) return;
      try {
        await syncOrchestrator.execute();
      } catch (error) {
        console.error("[SyncWorker] Falha na sincronização:", error);
      }
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      isOnline.current = !!(state.isConnected && state.isInternetReachable);
      if (isOnline.current) runSync();
    });

    timerRef.current = setInterval(runSync, SYNC_INTERVAL_MS);

    return () => {
      unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [dbReady, syncOrchestrator]);
}
