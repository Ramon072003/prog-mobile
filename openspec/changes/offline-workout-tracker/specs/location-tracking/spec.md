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
