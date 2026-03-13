## ADDED Requirements

### Requirement: Create and Track Workouts
The system SHALL allow users to create workouts, add specific exercises to them, and mark them as completed.

#### Scenario: Create a new workout
- **WHEN** the user taps "Iniciar Novo Treino" on the Home Screen
- **THEN** an active workout session is created with the current date

#### Scenario: Add exercise to workout
- **WHEN** the user selects an exercise from the pre-defined dropdown and inputs sets, reps, and weight
- **THEN** the exercise is linked to the active workout session in the local database

#### Scenario: Complete a workout
- **WHEN** the user taps "Concluir Treino"
- **THEN** the system marks the workout status as completed and navigates to the WorkoutDetail screen for that workout

### Requirement: Weekly History
The system SHALL display a summary of workouts completed during the current week.

#### Scenario: View weekly schedule
- **WHEN** the user opens the Home Screen
- **THEN** a list/summary of the week's completed workouts is displayed with essential metrics

#### Scenario: View empty weekly history
- **WHEN** the user opens the Home Screen and has no workouts logged in the current week
- **THEN** an encouraging empty state message is displayed with the "Iniciar Novo Treino" button prominently visible

### Requirement: Workout Detail Screen
The system SHALL display a dedicated detail screen for any completed workout, showing its exercises and, optionally, its location on a map.

#### Scenario: View workout detail
- **WHEN** the user taps on a past workout card on the Home Screen
- **THEN** the WorkoutDetail screen is displayed with the workout's date, list of exercises (with sets, reps, weight, and any photo thumbnail), and a map if coordinates are available

#### Scenario: Active workout navigates to detail after completion
- **WHEN** the user taps "Concluir Treino" and the workout is saved
- **THEN** the app navigates directly to the WorkoutDetail screen for the just-completed workout via `router.replace`

### Requirement: Sync Status Indicator
The system SHALL display a subtle sync status badge on each workout card in the Home Screen history.

#### Scenario: Workout card shows pending sync
- **WHEN** a workout card is rendered and its `sync_status` is `"pending"`
- **THEN** a ⏳ icon badge is visible on the card

#### Scenario: Workout card shows synced
- **WHEN** a workout card is rendered and its `sync_status` is `"synced"`
- **THEN** a ✅ icon badge is visible on the card
