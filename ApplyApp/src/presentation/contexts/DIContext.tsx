import React, { createContext, useContext, useMemo } from "react";

import { IWorkoutRepository } from "../../domain/repositories/IWorkoutRepository";
import { IWorkoutExerciseRepository } from "../../domain/repositories/IWorkoutExerciseRepository";
import { IExerciseRepository } from "../../domain/repositories/IExerciseRepository";
import { IUserProfileRepository } from "../../domain/repositories/IUserProfileRepository";
import { IMediaService } from "../../infrastructure/services/MediaService";
import { ILocationService } from "../../infrastructure/services/LocationService";

import { SQLiteWorkoutRepository } from "../../infrastructure/repositories/SQLiteWorkoutRepository";
import { SQLiteWorkoutExerciseRepository } from "../../infrastructure/repositories/SQLiteWorkoutExerciseRepository";
import { SQLiteExerciseRepository } from "../../infrastructure/repositories/SQLiteExerciseRepository";
import { SQLiteUserProfileRepository } from "../../infrastructure/repositories/SQLiteUserProfileRepository";
import { SupabaseWorkoutRepository } from "../../infrastructure/repositories/SupabaseWorkoutRepository";
import { SupabaseWorkoutExerciseRepository } from "../../infrastructure/repositories/SupabaseWorkoutExerciseRepository";
import { SupabaseExerciseRepository } from "../../infrastructure/repositories/SupabaseExerciseRepository";
import { SupabaseUserProfileRepository } from "../../infrastructure/repositories/SupabaseUserProfileRepository";
import { MediaService } from "../../infrastructure/services/MediaService";
import { LocationService } from "../../infrastructure/services/LocationService";

import { CreateWorkout } from "../../application/use-cases/CreateWorkout";
import { CompleteWorkout } from "../../application/use-cases/CompleteWorkout";
import { AddExerciseToWorkout } from "../../application/use-cases/AddExerciseToWorkout";
import { RemoveExerciseFromWorkout } from "../../application/use-cases/RemoveExerciseFromWorkout";
import { UpdateWorkoutExercise } from "../../application/use-cases/UpdateWorkoutExercise";
import { CloneWorkout } from "../../application/use-cases/CloneWorkout";
import { GetUserProfile } from "../../application/use-cases/GetUserProfile";
import { UpdateUserAvatar } from "../../application/use-cases/UpdateUserAvatar";
import { GetWeeklyWorkoutsSummary } from "../../application/use-cases/GetWeeklyWorkoutsSummary";
import { SyncWorkouts } from "../../application/use-cases/SyncWorkouts";
import { SyncExerciseList } from "../../application/use-cases/SyncExerciseList";
import { SyncOrchestrator } from "../../application/use-cases/SyncOrchestrator";
import { UploadPendingMedia } from "../../application/use-cases/UploadPendingMedia";

export interface DIContainer {
  // Repositories (local)
  workoutRepo: IWorkoutRepository;
  workoutExerciseRepo: IWorkoutExerciseRepository;
  exerciseRepo: IExerciseRepository;
  userProfileRepo: IUserProfileRepository;

  // Repositories (remote)
  remoteWorkoutRepo: IWorkoutRepository;
  remoteWorkoutExerciseRepo: IWorkoutExerciseRepository;
  remoteExerciseRepo: IExerciseRepository;
  remoteUserProfileRepo: IUserProfileRepository;

  // Services
  mediaService: IMediaService;
  locationService: ILocationService;

  // Use Cases
  createWorkout: CreateWorkout;
  completeWorkout: CompleteWorkout;
  addExerciseToWorkout: AddExerciseToWorkout;
  removeExerciseFromWorkout: RemoveExerciseFromWorkout;
  updateWorkoutExercise: UpdateWorkoutExercise;
  cloneWorkout: CloneWorkout;
  getUserProfile: GetUserProfile;
  updateUserAvatar: UpdateUserAvatar;
  getWeeklyWorkoutsSummary: GetWeeklyWorkoutsSummary;
  syncOrchestrator: SyncOrchestrator;
}

function createContainer(): DIContainer {
  // Local repos
  const workoutRepo = new SQLiteWorkoutRepository();
  const workoutExerciseRepo = new SQLiteWorkoutExerciseRepository();
  const exerciseRepo = new SQLiteExerciseRepository();
  const userProfileRepo = new SQLiteUserProfileRepository();

  // Remote repos
  const remoteWorkoutRepo = new SupabaseWorkoutRepository();
  const remoteWorkoutExerciseRepo = new SupabaseWorkoutExerciseRepository();
  const remoteExerciseRepo = new SupabaseExerciseRepository();
  const remoteUserProfileRepo = new SupabaseUserProfileRepository();

  // Services
  const mediaService = new MediaService();
  const locationService = new LocationService();

  // Use Cases
  const createWorkout = new CreateWorkout(workoutRepo);
  const completeWorkout = new CompleteWorkout(workoutRepo);
  const addExerciseToWorkout = new AddExerciseToWorkout(workoutExerciseRepo);
  const removeExerciseFromWorkout = new RemoveExerciseFromWorkout(workoutExerciseRepo);
  const updateWorkoutExercise = new UpdateWorkoutExercise(workoutExerciseRepo);
  const cloneWorkout = new CloneWorkout(workoutRepo, workoutExerciseRepo);
  const getUserProfile = new GetUserProfile(userProfileRepo, remoteUserProfileRepo);
  const updateUserAvatar = new UpdateUserAvatar(userProfileRepo, remoteUserProfileRepo, mediaService);
  const getWeeklyWorkoutsSummary = new GetWeeklyWorkoutsSummary(workoutRepo, workoutExerciseRepo, exerciseRepo);

  const syncWorkouts = new SyncWorkouts(workoutRepo, workoutExerciseRepo, remoteWorkoutRepo, remoteWorkoutExerciseRepo);
  const syncExercises = new SyncExerciseList(remoteExerciseRepo, exerciseRepo);
  const uploadPendingMedia = new UploadPendingMedia(workoutExerciseRepo, mediaService);
  const syncOrchestrator = new SyncOrchestrator(syncWorkouts, syncExercises, uploadPendingMedia);

  return {
    workoutRepo,
    workoutExerciseRepo,
    exerciseRepo,
    userProfileRepo,
    remoteWorkoutRepo,
    remoteWorkoutExerciseRepo,
    remoteExerciseRepo,
    remoteUserProfileRepo,
    mediaService,
    locationService,
    createWorkout,
    completeWorkout,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    updateWorkoutExercise,
    cloneWorkout,
    getUserProfile,
    updateUserAvatar,
    getWeeklyWorkoutsSummary,
    syncOrchestrator,
  };
}

const DIContext = createContext<DIContainer | null>(null);

export function DIProvider({ children }: { children: React.ReactNode }) {
  const container = useMemo(() => createContainer(), []);
  return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useDI(): DIContainer {
  const ctx = useContext(DIContext);
  if (!ctx) throw new Error("useDI must be used within DIProvider");
  return ctx;
}
