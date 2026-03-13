## ADDED Requirements

### Requirement: SQLite Repository Tests
The system SHALL verify that the SQLite repository implementations call the correct database methods.

#### Scenario: SQLiteWorkoutRepository saves a workout
- **WHEN** `SQLiteWorkoutRepository.save(workout)` is called with a valid workout object
- **THEN** the mocked `expo-sqlite` `execAsync` is called with an INSERT statement containing the workout's fields

#### Scenario: SQLiteWorkoutRepository retrieves pending workouts
- **WHEN** `SQLiteWorkoutRepository.getPending()` is called
- **THEN** the mocked `expo-sqlite` `getAllAsync` is called and the repository returns the mocked pending workout array

### Requirement: Supabase Auth Repository Tests
The system SHALL verify that the Supabase Auth repository correctly delegates to the Supabase client mock.

#### Scenario: Login delegates to Supabase signInWithPassword
- **WHEN** `SupabaseAuthRepository.login({ email, password })` is called
- **THEN** the mocked `supabase.auth.signInWithPassword` is called with the correct credentials

#### Scenario: Logout delegates to Supabase signOut
- **WHEN** `SupabaseAuthRepository.logout()` is called
- **THEN** the mocked `supabase.auth.signOut` is called once

### Requirement: Supabase Storage Repository Tests
The system SHALL verify that the media upload repository correctly uploads files and returns a public URL.

#### Scenario: Upload returns public URL on success
- **WHEN** `SupabaseStorageRepository.upload({ localUri, path })` is called with a mocked successful upload
- **THEN** the method returns the mocked public URL string

#### Scenario: Upload propagates error on failure
- **WHEN** `SupabaseStorageRepository.upload()` is called and the mocked Supabase client returns an error
- **THEN** the method throws an error with the Supabase error message

### Requirement: Location Service Tests
The system SHALL verify that the location service correctly requests permissions and returns coordinates.

#### Scenario: Returns coordinates when permission is granted
- **WHEN** `LocationService.getCurrentCoords()` is called and `expo-location` mock returns granted permission and coordinates
- **THEN** the method returns `{ latitude, longitude }` matching the mocked values

#### Scenario: Throws when permission is denied
- **WHEN** `LocationService.getCurrentCoords()` is called and `expo-location` mock returns denied permission
- **THEN** the method throws a permissions error
