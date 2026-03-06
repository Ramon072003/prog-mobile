## 1. Init and Setup

- [ ] 1.1 Scaffold the Expo application
- [ ] 1.2 Install core dependencies (Supabase, expo-sqlite, expo-camera, expo-location, react-native-maps)
- [ ] 1.3 Setup Clean Architecture structure (`domain`, `application`, `infrastructure`, `presentation`)

## 2. Supabase Integration & Auth

- [ ] 2.1 Initialize Supabase client
- [ ] 2.2 Create Auth screens (Login, Sign Up)
- [ ] 2.3 Implement Authentication flow and session management
- [ ] 2.4 Setup Database schema in Supabase (remote db)

## 3. Local Database & Sync Foundation

- [ ] 3.1 Initialize expo-sqlite local database
- [ ] 3.2 Create local tables (exercises, workouts, workout_exercises)
- [ ] 3.3 Implement Exercise Master List sync (download from Supabase to local SQLite)
- [ ] 3.4 Implement background sync worker to upload local data to Supabase

## 4. Workout Management UI

- [ ] 4.1 Create Home Screen with Weekly History summary
- [ ] 4.2 Create Active Workout Screen (date, list of added exercises)
- [ ] 4.3 Create "Add Exercise" Modal/Screen with offline Dropdown

## 5. Media & Location Enhancements

- [ ] 5.1 Integrate expo-camera in the "Add Exercise" screen
- [ ] 5.2 Implement local filesystem save and background Supabase Storage upload
- [ ] 5.3 Implement expo-location capture on Workout Completion
- [ ] 5.4 Add Map View to Workout Details
