## ADDED Requirements

### Requirement: Location Capture
The system SHALL capture the geographical coordinates of the user exactly when a workout is completed.

#### Scenario: Retrieve and save coordinates
- **WHEN** the user taps "Concluir Treino" to end an active workout session
- **THEN** the app silently pulls latitude and longitude metrics and saves them with the workout data

### Requirement: Location Mapping
The system SHALL display the recorded location of a completed workout visually via a map.

#### Scenario: Display workout map
- **WHEN** the user views the details of a completed workout that has stored coordinates
- **THEN** a map component is rendered indicating the geographical point where the workout concluded

#### Scenario: Map omitted when coordinates are unavailable
- **WHEN** the user views the details of a completed workout that has no stored coordinates (permission denied or GPS unavailable)
- **THEN** the map component is not rendered and no error or placeholder message is displayed

### Requirement: Just-in-Time Location Permission
The system SHALL request location permission only at the moment the user attempts to complete a workout.

#### Scenario: Permission requested on workout completion
- **WHEN** the user taps "Concluir Treino" for the first time
- **THEN** the system requests foreground location permission before attempting to capture coordinates
