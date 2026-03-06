## Context

O aplicativo de academia visa garantir uma interface rápida e ininterrupta para usuários, independentemente da conexão com a internet (que costuma ser falha em academias). O foco é ser um projeto robusto de aula, utilizando as tecnologias React Native (Expo SDK recente), Supabase, e SQLite.

## Goals / Non-Goals

**Goals:**
- Prover uma experiência "Offline-First" resiliente e reativa, onde o uso do banco de dados local em SQLite seja a fundação de leitura/escrita da UI.
- Sincronização em background otimizada e tolerante a perdas de conexão com o Supabase.
- Armazenamento condicional de mídias (foto/vídeo de exercícios) e captura de coordenadas geográficas.
- **Implementar Clean Architecture (Pragmática):** Separar as responsabilidades do aplicativo em camadas claras (Domain, Use Cases, Repositories, Presentation) para garantir que a UI não conheça detalhes de implementação do SQLite ou do Supabase.

**Non-Goals:**
- Adicionar componentes comunitários ou sociais (ex: feed de treinos).
- Implementação de relatórios avançados em gráficos; o foco atual é o histórico semanal básico.
- Modificação manual da lista mestre de exercícios pelo usuário no próprio app (apenas leitura).
- Sobrecarga de padrões DDD (como Value Objects complexos ou Event Sourcing); o foco é na separação via *Interfaces* (Clean Architecture).

## Decisions

- **Clean Architecture:** O projeto será dividido em camadas. 
  - `domain/`: Entidades core (Workout, Exercise) e interfaces (IWorkoutRepository).
  - `application/`: Casos de uso específicos (SaveWorkoutOffline, SyncWorkouts).
  - `infrastructure/`: Implementação real das interfaces (SQLiteWorkoutRepository, SupabaseWorkoutRepository).
  - `presentation/`: Telas e componentes React Native usando hooks para consumir os Use Cases.
- **Local-First Database (expo-sqlite):** A escolha em priorizar as operações diretamente no SQLite e deixar as mutações de nuvem isoladas no Background. Evita telas de carregamento contínuas.
- **Mídia Diferida com FileSystem API:** Uma imagem é salva como um arquivo local temporário. Como o upload pode falhar no Supabase Storage quando offline, marcamos os registros no DB com o status correspondente e gerenciamos uma fila de "retry" ao recuperar conectividade.
- **React Native Maps para Tracking Opcional:** O Expo Location fará ping das coordenadas no botão de concluir o treino, convertendo os dados numa view de mapa se disponíveis, não obstrutiva.

## Risks / Trade-offs

- **[Risk] Mídias Pendentes Órfãs:** O usuário pode deletar as fotos da galeria nativa antes do upload assíncrono.
  - Mitigação: Armazenar a mídia capturada num diretório enclausurado dentro do FileSystem do Expo app, que não fique exportado por padrão.
- **[Risk] Complexidade de Filas de API:** Escrever rotinas lógicas de Retry e State Machine num projeto de escopo curto de aula iterativa.
  - Mitigação: Uma arquitetura em tabela: uma coluna indicadora (ex: `sync_status` e `media_sync`) bastam como flag reativa para disparar requisições em idle.
