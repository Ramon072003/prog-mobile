## ADDED Requirements

### Requirement: Entity State Transition Tests
The system SHALL validate that Domain entity classes enforce correct state machine transitions.

#### Scenario: Workout status transitions to completed
- **WHEN** `workout.complete()` is called on an active workout
- **THEN** `workout.status` equals `"completed"` and `workout.sync_status` remains `"pending"`

#### Scenario: Invalid transition is rejected
- **WHEN** `workout.complete()` is called on a workout that is already `"completed"`
- **THEN** the method throws an error indicating the transition is invalid

### Requirement: Entity Field Validation Tests
The system SHALL validate that Domain entity classes reject invalid field values at construction.

#### Scenario: WorkoutExercise rejects zero reps
- **WHEN** a `WorkoutExercise` is constructed with `reps` equal to 0
- **THEN** the constructor throws a validation error

#### Scenario: WorkoutExercise rejects negative weight
- **WHEN** a `WorkoutExercise` is constructed with `weight` less than 0
- **THEN** the constructor throws a validation error

### Requirement: Sync Status Transition Tests
The system SHALL validate that sync state transitions follow the defined state machine.

#### Scenario: Workout marks as synced
- **WHEN** `workout.markSynced()` is called on a workout with `sync_status` of `"pending"`
- **THEN** `workout.sync_status` equals `"synced"`

#### Scenario: Workout marks as failed and retries
- **WHEN** `workout.markFailed()` is called and then `workout.retrySync()` is called
- **THEN** `workout.sync_status` returns to `"pending"`
