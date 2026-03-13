## 1. Testing Setup

- [ ] 1.1 Install test dependencies: `jest`, `jest-expo`, `@testing-library/react-native`, `@types/jest`
- [ ] 1.2 Configure `jest.config.js` with `jest-expo` preset, `moduleNameMapper`, and `coverageThreshold` (70% global, 85% Domain/Application)
- [ ] 1.3 Add `test` and `test:coverage` scripts to `package.json`
- [ ] 1.4 Create `__mocks__/expo-sqlite.ts` with stubs for `openDatabaseAsync`, `execAsync`, `getAllAsync`
- [ ] 1.5 Create `__mocks__/@supabase/supabase-js.ts` with stubs for `auth`, `from`, and `storage`
- [ ] 1.6 Create `__mocks__/expo-location.ts` with stubs for `requestForegroundPermissionsAsync` and `getCurrentPositionAsync`
- [ ] 1.7 Create `__mocks__/expo-camera.ts` with stubs for `useCameraPermissions` and `CameraView`
- [ ] 1.8 Create `__mocks__/expo-file-system.ts` with stubs for `moveAsync` and `documentDirectory`
- [ ] 1.9 Create `__mocks__/@react-native-community/netinfo.ts` with stub for `addEventListener`

## 2. Domain Tests

- [ ] 2.1 Write `Workout` entity class with `status` and `sync_status` fields and transition methods (`complete()`, `markSynced()`, `markFailed()`, `retrySync()`)
- [ ] 2.2 Write `src/domain/entities/__tests__/Workout.test.ts` covering all status and sync transitions and invalid transition errors
- [ ] 2.3 Write `WorkoutExercise` entity class with constructor validation for `sets`, `reps`, and `weight`
- [ ] 2.4 Write `src/domain/entities/__tests__/WorkoutExercise.test.ts` covering validation rejections (zero reps, negative weight)
- [ ] 2.5 Write `Exercise` entity class with field validation for `name` and `muscle_group`
- [ ] 2.6 Write `src/domain/entities/__tests__/Exercise.test.ts` covering validation scenarios

## 3. Application (Use Case) Tests

- [ ] 3.1 Write `src/application/use-cases/__tests__/createWorkout.test.ts` verifying `save()` called with `status: "active"`, `sync_status: "pending"`
- [ ] 3.2 Write `src/application/use-cases/__tests__/addExerciseToWorkout.test.ts` verifying repository `save()` with correct `workoutId` and exercise fields
- [ ] 3.3 Write `src/application/use-cases/__tests__/completeWorkout.test.ts` verifying location service called and `update()` called with coordinates and `status: "completed"`
- [ ] 3.4 Write `src/application/use-cases/__tests__/syncWorkouts.test.ts` verifying pending workouts are upserted and marked as `"synced"`
- [ ] 3.5 Write `src/application/use-cases/__tests__/syncExerciseList.test.ts` verifying remote list is passed to `localExerciseRepository.saveAll()`

## 4. Infrastructure Tests

- [ ] 4.1 Write `src/infrastructure/repositories/__tests__/SQLiteWorkoutRepository.test.ts` verifying `execAsync` is called on `save()` and `getAllAsync` on `getPending()`
- [ ] 4.2 Write `src/infrastructure/repositories/__tests__/SupabaseAuthRepository.test.ts` verifying `signInWithPassword` and `signOut` delegations
- [ ] 4.3 Write `src/infrastructure/repositories/__tests__/SupabaseStorageRepository.test.ts` verifying upload returns public URL and propagates errors
- [ ] 4.4 Write `src/infrastructure/services/__tests__/LocationService.test.ts` verifying coordinates returned on granted permission and error thrown on denied

## 5. Presentation Tests

- [ ] 5.1 Write `src/presentation/screens/__tests__/HomeScreen.test.tsx` covering workout card rendering and navigation to ActiveWorkout
- [ ] 5.2 Write `src/presentation/screens/__tests__/ActiveWorkoutScreen.test.tsx` covering exercise display after add and `completeWorkout` call on button press
- [ ] 5.3 Write `src/presentation/screens/__tests__/AddExerciseModal.test.tsx` covering exercise list rendering from mocked hook
- [ ] 5.4 Write `src/presentation/screens/__tests__/LoginScreen.test.tsx` and `SignUpScreen.test.tsx` covering error message display
- [ ] 5.5 Write `src/presentation/hooks/__tests__/useSyncWorker.test.ts` verifying sync triggered on `isConnected: true` and not called on `isConnected: false`
