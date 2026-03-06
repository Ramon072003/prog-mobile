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
- **THEN** the system marks the workout status as completed and returns to the Home Screen

### Requirement: Weekly History
The system SHALL display a summary of workouts completed during the current week.

#### Scenario: View weekly schedule
- **WHEN** the user opens the Home Screen
- **THEN** a list/summary of the week's completed workouts is displayed with essential metrics
