## ADDED Requirements

### Requirement: HomeScreen Rendering Tests
The system SHALL verify that the HomeScreen renders the weekly history and primary action correctly.

#### Scenario: Renders workout cards from mocked hook
- **WHEN** `<HomeScreen />` is rendered with a mocked `useWeeklyWorkouts` returning 3 workouts
- **THEN** 3 elements with `testID="workout-card"` are present in the rendered output

#### Scenario: Navigates to ActiveWorkout on button press
- **WHEN** the user presses the element with `testID="start-workout-button"`
- **THEN** the mocked Expo Router `router.push` is called with `"/active-workout"`

### Requirement: ActiveWorkout Screen Tests
The system SHALL verify that the ActiveWorkout screen can add exercises and complete a workout.

#### Scenario: Displays added exercise after submission
- **WHEN** the user submits the Add Exercise modal with valid data via the mocked `useAddExercise` hook
- **THEN** the exercise name appears in the screen's exercise list

#### Scenario: Calls completeWorkout on button press
- **WHEN** the user presses the element with `testID="complete-workout-button"`
- **THEN** the mocked `useCompleteWorkout` mutate function is called once

### Requirement: Add Exercise Modal Tests
The system SHALL verify that the Add Exercise modal filters exercises and submits correctly.

#### Scenario: Renders exercise options from SQLite mock
- **WHEN** `<AddExerciseModal />` is rendered with a mocked local exercise list of 5 exercises
- **THEN** 5 selectable exercise items are visible in the dropdown

### Requirement: Auth Screen Tests
The system SHALL verify that the Login and SignUp screens display appropriate error feedback.

#### Scenario: Login screen shows error on failed auth
- **WHEN** the mocked `useLogin` hook returns `{ error: "Invalid credentials" }`
- **THEN** the element with `testID="auth-error-message"` is visible with the error text

#### Scenario: SignUp screen shows error on duplicate email
- **WHEN** the mocked `useSignUp` hook returns `{ error: "Email already registered" }`
- **THEN** the element with `testID="auth-error-message"` is visible with the error text

### Requirement: useSyncWorker Hook Tests
The system SHALL verify that the `useSyncWorker` hook triggers sync use cases when network connectivity is detected.

#### Scenario: Calls syncWorkouts when network becomes available
- **WHEN** `useSyncWorker({ syncWorkouts: mockFn, uploadPendingMedia: mockFn })` is rendered and the mocked NetInfo emits `isConnected: true`
- **THEN** `syncWorkouts` is called once within the `waitFor` interval

#### Scenario: Does not call sync when network is unavailable
- **WHEN** `useSyncWorker(...)` is rendered and the mocked NetInfo emits `isConnected: false`
- **THEN** `syncWorkouts` is never called
