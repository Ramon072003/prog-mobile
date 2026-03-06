# Notas de Exploração: App de Treinos (Expo + SQLite + Supabase)

Este documento registra as decisões arquiteturais e de fluxo tomadas durante a fase de exploração do projeto.

## 1. Visão Geral
* **Objetivo:** Criar um app mobile de registro de treinos de academia focado em simplicidade e funcionamento robusto (projeto de aula).
* **Stack Principal:** React Native, Expo (SDK recente), SQLite (`expo-sqlite`), Supabase (Auth, Database, Storage), Expo Camera, Expo Location, React Native Maps.
* **Arquitetura Base:** Offline-First (Local primeiro, Nuvem em background).

## 2. Decisões Arquiteturais (O "Pulo do Gato")
* **Estratégia de Sincronização (Opção A):** 
  O aplicativo será *Offline-First*.
  1. O usuário salva o treino/exercício.
  2. Os dados são salvos imediatamente no SQLite local (garantindo interface rápida e sem bloqueios).
  3. Em background, o app tenta enviar os dados para o Supabase.
  4. Se não houver internet, os registros ficam com status de "pendente de sincronização" no SQLite e são enviados quando a conexão for reestabelecida.
* **Clean Architecture Pragmática & DDD:** 
  Uso de uma estrutura focada na separação de responsabilidades para isolar a UI da Fonte de Dados. O projeto terá as seguintes camadas:
  1. `domain/`: Entidades (Workout, Exercise) e abstrações/interfaces (Ex: `IWorkoutRepository`).
  2. `application/`: Casos de uso (Ex: `SaveWorkoutOffline`, `SyncWorkouts`).
  3. `infrastructure/`: Implementação com as tecnologias reais (`SQLiteWorkoutRepository`, `SupabaseWorkoutRepository`).
  4. `presentation/`: Telas e componentes React Native usando hooks para chamar o Application.
* **Lista de Exercícios:**
  Será uma lista pré-cadastrada (Dropdown) para facilitar e padronizar o cadastro durante o treino. O aplicativo baixará essa lista do Supabase para o SQLite.
* **Mídias Offline (Expo Camera):**
  A captura de fotos/vídeos não exigirá internet imediata. O app salvará o caminho local da URI (FileSystem) no SQLite. O upload para o Supabase Storage ocorrerá quando houver rede, e a URL pública será atualizada no banco.
* **Geolocalização (Expo Location):**
  A captura da Latitude/Longitude ocorrerá no momento em que o treino for salvo/concluído. A interface mostrará um mapa visual (ex: `react-native-maps`) apontando onde o treino foi realizado.

## 3. Modelo de Dados (Mental)
Tabelas principais (existirão em ambos os lados, Sync Supabase <-> SQLite):
* `users`: Gerenciado pelo Supabase Auth.
* `exercises`: Tabela de leitura (id, name, muscle_group).
* `workouts`: Treinos realizados (id gerado como UUID local, date, day_of_week, latitude, longitude, status, sync_status).
* `workout_exercises`: Exercícios atrelados a um treino (id, workout_id, exercise_id, sets, reps, weight, media_local_uri, media_storage_url).

## 4. Fluxo de Telas (Proposta Enxuta)
1. **Tela de Login/Cadastro** (Supabase Auth).
2. **Tela Inicial (Home / Histórico):**
   * Resumo semanal dos treinos.
   * Botão principal: "Iniciar Novo Treino".
3. **Tela do Treino Ativo:**
   * Mostra data/dia.
   * Lista de exercícios já adicionados naquele treino.
   * Botão "+ Adicionar Exercício".
   * Botão "Concluir Treino" (Registra Geolocalização e mostra o Mapa).
4. **Modal / Tela de Cadastro de Exercício:**
   * Dropdown de exercícios.
   * Campos de Séries, Repetições, Carga.
   * Botão para abrir a Câmera (Tirar Foto / Gravar Vídeo).

## 5. Execução da Proposta (OpenSpec Propose)
A partir destas definições, executamos o comando `/opsx-propose` que consolidou nossa exploração e gerou a estrutura formal do projeto em `openspec/changes/offline-workout-tracker/`:

* `proposal.md`: Documento de fundação com a motivação e as capacidades (capabilities) que o sistema terá.
* `design.md`: Desenho da arquitetura técnica justificando a abordagem "Offline-First", os trade-offs e a mitigação de riscos (como mídias órfãs e complexidade de filas de API).
* `specs/`: Contrato detalhado do que será construído:
  * `user-auth/spec.md`: Autenticação e gestão de sessão offline.
  * `workout-management/spec.md`: Ciclo de vida dos treinos.
  * `offline-sync/spec.md`: Mecanismos de armazenamento local (SQLite) e filas de sincronização com o Supabase.
  * `media-capture/spec.md`: Fotos/vídeos e upload assíncrono.
  * `location-tracking/spec.md`: Coordenadas e visualização no mapa.
* `tasks.md`: Lista passo a passo de tarefas de implementação, dividida em 5 fases (Setup, Autenticação, Banco de Dados, UI, UI Avançada).

## Próximos Passos
* Iniciar a implementação real rodando o comando `/opsx-apply`.
