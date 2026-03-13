## ADDED Requirements

### Requirement: createWorkout Use Case Test
The system SHALL verify that the `createWorkout` use case persists a new workout locally with pending sync status.

#### Scenario: Creates workout with correct initial state
- **WHEN** `createWorkout({ userId, date })` is called
- **THEN** the injected `workoutRepository.save()` is called once with an object containing `status: "active"` and `sync_status: "pending"`

### Requirement: addExerciseToWorkout Use Case Test
The system SHALL verify that the `addExerciseToWorkout` use case correctly links an exercise entry to an active workout.

#### Scenario: Links exercise to active workout
- **WHEN** `addExerciseToWorkout({ workoutId, exerciseId, sets, reps, weight })` is called
- **THEN** the injected `workoutExerciseRepository.save()` is called with the correct `workoutId` and exercise fields

### Requirement: completeWorkout Use Case Test
The system SHALL verify that the `completeWorkout` use case captures location and transitions the workout to completed status.

#### Scenario: Captures coordinates and completes workout
- **WHEN** `completeWorkout({ workoutId })` is called with a mocked location service returning `{ latitude: -23.5, longitude: -46.6 }`
- **THEN** `workoutRepository.update()` is called with `status: "completed"`, `latitude: -23.5`, and `longitude: -46.6`

### Requirement: syncWorkouts Use Case Test
The system SHALL verify that the `syncWorkouts` use case uploads all pending local records to Supabase.

#### Scenario: Sends pending workouts to remote repository
- **WHEN** `syncWorkouts()` is called and the local repository returns two workouts with `sync_status: "pending"`
- **THEN** the injected `remoteWorkoutRepository.upsert()` is called with both workouts, and each is marked as `"synced"` locally

### Requirement: syncExerciseList Use Case Test
The system SHALL verify that the `syncExerciseList` use case downloads and caches the exercise master list from Supabase.

#### Scenario: Populates local SQLite with exercise data
- **WHEN** `syncExerciseList()` is called and the remote repository returns a list of 10 exercises
- **THEN** `localExerciseRepository.saveAll()` is called with all 10 exercises
