## 1. Init and Setup

- [x] 1.1 Scaffold the Expo application
- [x] 1.2 Install core dependencies (Supabase, expo-sqlite, expo-camera, expo-location, react-native-maps)
- [x] 1.3 Setup Clean Architecture structure (`domain`, `application`, `infrastructure`, `presentation`)
- [x] 1.4 [TDD] Install test dependencies (jest-expo, @testing-library/react-native, @types/jest)
- [x] 1.5 [TDD] Configure `jest.config.js` with preset, moduleNameMapper e coverageThreshold (70% global)
- [x] 1.6 [TDD] Create `__mocks__/` with manual mocks for expo-sqlite, @supabase/supabase-js, expo-location, expo-camera, expo-file-system, netinfo

## 2. Supabase Integration & Auth

- [x] 2.1 Initialize Supabase client
- [x] 2.2 Create Auth screens (Login, Sign Up)
- [x] 2.3 Implement Authentication flow and session management
- [x] 2.4 Setup Database schema in Supabase (remote db)

## 3. Local Database & Sync Foundation

- [x] 3.1 Initialize expo-sqlite local database
- [x] 3.2 Create local tables (exercises, workouts, workout_exercises)
- [x] 3.3 Implement Exercise Master List sync (download from Supabase to local SQLite)
- [x] 3.4 Implement background sync worker to upload local data to Supabase
- [x] 3.5 [TDD] Write Domain entity tests (Workout, WorkoutExercise, Exercise — validações e transições de estado)
- [x] 3.6 [TDD] Write Application use case tests (createWorkout, addExerciseToWorkout, completeWorkout, syncWorkouts, syncExerciseList)
- [x] 3.7 [TDD] Write Infrastructure repository tests (SQLiteWorkoutRepository, SupabaseAuthRepository, SupabaseStorageRepository, LocationService)

## 4. Workout Management UI

- [x] 4.1 Create Home Screen with Weekly History summary (empty state + sync badge per card)
- [x] 4.2 Create Active Workout Screen (date, list of added exercises, empty state guide)
- [x] 4.3 Create "Add Exercise" Modal/Screen with offline Dropdown (empty state for no exercises)
- [x] 4.4 Create WorkoutDetail Screen (`/workout/[id]`) with exercise list, photo thumbnails, and conditional map
- [ ] 4.5 [TDD] Write Presentation tests (HomeScreen, ActiveWorkoutScreen, AddExerciseModal, WorkoutDetailScreen, LoginScreen, SignUpScreen)
- [ ] 4.6 [TDD] Write `useSyncWorker` hook tests (trigger com NetInfo mockado, injeção de use cases)

## 5. Media & Location Enhancements

- [x] 5.1 Integrate expo-camera in the "Add Exercise" screen (just-in-time permission)
- [x] 5.2 Implement local filesystem save and background Supabase Storage upload
- [x] 5.3 Implement expo-location capture on Workout Completion (just-in-time permission, silent omission if denied)
- [ ] 5.4 Add Map View to WorkoutDetail screen (conditional render — omit if no coords)
- [ ] 5.5 [TDD] Verify coverage ≥ 70% com `npm run test:coverage` e ajustar testes faltantes
