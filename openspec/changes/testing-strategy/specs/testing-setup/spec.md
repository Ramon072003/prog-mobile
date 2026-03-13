## ADDED Requirements

### Requirement: Jest Environment Configuration
The system SHALL provide a working Jest configuration using the `jest-expo` preset, enabling tests to run for all Expo module types.

#### Scenario: Run test suite
- **WHEN** the developer runs `npm test`
- **THEN** Jest executes all `*.test.ts` and `*.test.tsx` files under `src/` using the `jest-expo` preset without manual Babel configuration

#### Scenario: Coverage report
- **WHEN** the developer runs `npm run test:coverage`
- **THEN** Jest generates a coverage report and fails the run if global line coverage is below 70%

### Requirement: Centralized Manual Mocks
The system SHALL provide manual mock files in `__mocks__/` for all native and third-party modules used by the application.

#### Scenario: expo-sqlite mock resolves automatically
- **WHEN** any test file imports a module that uses `expo-sqlite`
- **THEN** Jest resolves the mock from `__mocks__/expo-sqlite.ts` automatically without requiring `jest.mock()` calls in individual test files

#### Scenario: Supabase mock resolves automatically
- **WHEN** any test file imports a module that uses `@supabase/supabase-js`
- **THEN** Jest resolves the mock from `__mocks__/@supabase/supabase-js.ts` with `jest.fn()` stubs for auth, database, and storage methods
