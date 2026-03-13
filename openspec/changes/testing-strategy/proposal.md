## Why

O app de treinos usa Clean Architecture, mas sem testes automatizados toda a separação de camadas perde valor — bugs em regras de negócio (status de treino, sync, validações) só seriam descobertos manualmente. Adicionar TDD agora, antes do primeiro código, garante confiança nas entregas de cada fase do projeto de aula.

## What Changes

- Adição do setup de testes (Jest + `jest-expo` preset + `@testing-library/react-native`) ao projeto Expo.
- Criação de mocks manuais centralizados em `__mocks__/` para `expo-sqlite`, `@supabase/supabase-js`, `expo-location`, `expo-camera` e `expo-file-system`.
- Adição de testes unitários para as entidades (`Workout`, `WorkoutExercise`, `Exercise`) e suas transições de estado.
- Adição de testes unitários para cada use case da camada Application com repositórios injetados como mocks.
- Adição de testes de integração de repositório para a camada Infrastructure (SQLite e Supabase com mocks de módulo).
- Adição de testes de componente para as telas principais (Home, Active Workout, Modal Add Exercise, Auth screens).
- Adição de testes para o hook `useSyncWorker` com NetInfo mockado e use cases injetados.
- Configuração de meta de cobertura de linhas de **70%** via `coverageThreshold` no `jest.config.js`.

## Capabilities

### New Capabilities
- `testing-setup`: Configuração do ambiente de testes (Jest, presets, mocks centralizados, scripts e cobertura).
- `domain-tests`: Testes unitários das entidades e regras de negócio do Domain.
- `application-tests`: Testes unitários dos use cases da camada Application.
- `infrastructure-tests`: Testes de repositório SQLite, Supabase Auth/Storage, Location e Camera com mocks.
- `presentation-tests`: Testes de componente das telas e do hook `useSyncWorker`.

### Modified Capabilities

## Impact

Afeta a configuração raiz do projeto (`jest.config.js`, `package.json` scripts). Cada camada existente (`domain/`, `application/`, `infrastructure/`, `presentation/`) ganha um diretório `__tests__/` paralelo. Nenhuma mudança no código de produção é necessária — o impacto é puramente aditivo na estrutura de arquivos e nas dependências de desenvolvimento.
