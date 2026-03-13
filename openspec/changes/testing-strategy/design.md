## Context

O projeto usa Clean Architecture (Domain → Application → Infrastructure → Presentation) com Expo + React Native, SQLite offline-first e Supabase. Sem uma estratégia de testes definida, a separação de camadas não oferece garantias reais — erros em transições de estado, lógica de sync ou queries podem passar despercebidos até o build final. Este documento define as decisões técnicas que tornam cada camada testável de forma independente e eficiente.

## Goals / Non-Goals

**Goals:**
- Definir a configuração mínima de Jest que funcione com o preset `jest-expo` e módulos nativos do Expo.
- Estabelecer a estratégia de mock manual para todos os módulos nativos e de terceiros.
- Garantir que cada camada seja testável de forma isolada, sem dependências reais de rede ou dispositivo.
- Atingir 70% de cobertura de linhas, com maior exigência nas camadas Domain e Application.

**Non-Goals:**
- Testes E2E (Detox ou similar) — fora do escopo do projeto de aula.
- Testes de performance ou de acessibilidade visual.
- 100% de cobertura — a meta é cobertura dos fluxos principais, não exaustividade.

## Decisions

- **jest-expo preset:** Usado como base do `jest.config.js`. Garante transformação correta de módulos nativos do Expo sem configuração manual de Babel/Metro.
- **Mocks manuais em `__mocks__/`:** Colocados na raiz do projeto para que o Jest os resolva automaticamente. Cada mock exporta um objeto com as mesmas assinaturas do módulo real, mas com `jest.fn()`. Alternativa considerada: `jest.mock()` inline — descartada por criar duplicidade e dificultar reutilização entre arquivos de teste.
- **Entidades como classes com métodos:** `Workout`, `WorkoutExercise` e `Exercise` são classes com métodos de transição de estado (`complete()`, `markSynced()`, `markFailed()`). Isso torna as regras de negócio testáveis unitariamente sem precisar instanciar repositórios. Alternativa considerada: plain objects + funções utilitárias — descartada por dificultar o encapsulamento de invariantes.
- **Hooks estilo react-query:** Os hooks de Presentation retornam `{ mutate, isPending, error }`, testáveis com `renderHook` + `waitFor`. O estado assíncrono fica encapsulado no hook, não espalhado nos componentes.
- **`useSyncWorker` com injeção de dependências:** O hook recebe os use cases de sync como parâmetros, permitindo que testes substituam `syncWorkoutsUseCase` e `uploadPendingMediaUseCase` por `jest.fn()` sem mockar SQLite ou Supabase. O trigger de rede via `@react-native-community/netinfo` é mockado para simular conectividade.
- **coverageThreshold:** Configurado no `jest.config.js` com threshold global de 70% de linhas. Domain e Application devem manter ≥ 85%.

## Risks / Trade-offs

- **[Risk] Mocks de SQLite não validam SQL:** Testar `SQLiteWorkoutRepository` com um mock de `expo-sqlite` não detecta erros de query SQL (ex: nome de coluna errado). Mitigação: Nomear queries como constantes e revisar manualmente nas tarefas de implementação do banco.
- **[Risk] Testes de Presentation frágeis:** Selecionar elementos por texto ou posição pode quebrar com qualquer mudança de UI. Mitigação: Usar `testID` em todos os elementos interativos e nunca testar estilos visuais.
- **[Risk] Divergência entre mock e API real:** Um mock de `@supabase/supabase-js` pode não refletir mudanças de versão da biblioteca. Mitigação: Centralizar o mock em `__mocks__/@supabase/supabase-js.ts` e revisar ao atualizar a dependência.
