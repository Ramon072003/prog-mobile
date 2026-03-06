## ADDED Requirements

### Requirement: Media Capture
The system SHALL allow users to capture photos or record videos for a specific exercise within an active workout.

#### Scenario: Capture local photo
- **WHEN** the user taps the camera button within the "Add Exercise" modal
- **THEN** the camera opens, captures media, and saves the file locally, recording its URI in the local database

### Requirement: Asynchronous Media Upload
The system SHALL upload cached media files to Supabase Storage when a network connection is available.

#### Scenario: Deferred upload in background
- **WHEN** network connectivity is detected and there are exercises with a pending media file
- **THEN** the background process uploads the file to Supabase Storage, and updates the database record with the public URL
