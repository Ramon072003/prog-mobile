# Prompt Antigravity — Evolução do Repforge Tracker

## Contexto do Projeto

O **Repforge Tracker** é um app de treinos offline-first construído com React Native + Expo SDK, usando Clean Architecture (Domain → Application → Infrastructure → Presentation), SQLite como storage local e Supabase para autenticação e sincronização remota.

O app já tem implementado:
- Autenticação (login/signup) com Supabase Auth (email + senha)
- Home com lista de treinos da semana
- Tela de treino ativo com timer e lista de exercícios
- Seletor de exercícios com busca
- Input de exercício (séries, reps, peso) com captura de foto
- Tela de detalhe do treino com mapa (se houver coordenadas)
- Sync offline-first SQLite ↔ Supabase
- Captura de localização ao finalizar treino
- Captura de foto via câmera

## Problema

A implementação atual diverge significativamente dos wireframes originais (em `/docs/screen1.png` a `screen4.png`). Existem funcionalidades importantes faltando e a experiência do usuário está empobrecida. Precisamos evoluir o app para ficar fiel ao design planejado e adicionar as funcionalidades que faltam.

---

## FASE 1 — Perfil do Usuário e Cadastro Completo

### Motivação
O cadastro atual pede apenas email e senha. Os wireframes mostram saudação personalizada ("Bom treino, Rafael") e avatar do usuário. Sem dados de perfil, essa personalização é impossível.

### Tasks

**1.1 — Criar entidade `UserProfile` no domínio**
- Arquivo: `src/domain/entities/UserProfile.ts`
- Campos: `id` (string, mesmo do Supabase Auth), `name` (string, obrigatório), `avatar_url` (string, opcional), `created_at`, `updated_at`
- Validação: nome não pode ser vazio, mínimo 2 caracteres

**1.2 — Criar tabela `user_profiles` no SQLite**
- Arquivo: `src/infrastructure/database/sqlite.ts`
- Adicionar CREATE TABLE na inicialização do banco
- Campos: id TEXT PRIMARY KEY, name TEXT NOT NULL, avatar_url TEXT, created_at, updated_at

**1.3 — Criar tabela `user_profiles` no Supabase**
- SQL: `CREATE TABLE user_profiles (id UUID REFERENCES auth.users PRIMARY KEY, name TEXT NOT NULL, avatar_url TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`
- Adicionar ao `docs/supabase_schema.sql`

**1.4 — Criar repositórios de UserProfile**
- Interface: `src/domain/repositories/IUserProfileRepository.ts`
  - Métodos: `save(profile)`, `findByUserId(userId)`, `update(profile)`
- SQLite: `src/infrastructure/repositories/SQLiteUserProfileRepository.ts`
- Supabase: `src/infrastructure/repositories/SupabaseUserProfileRepository.ts`

**1.5 — Atualizar tela de Signup**
- Arquivo: `app/(auth)/signup.tsx`
- Adicionar campo "Nome completo" ANTES dos campos de email e senha
- Após `supabase.auth.signUp` com sucesso, criar registro em `user_profiles` via repositório
- Validação: nome obrigatório, mínimo 2 caracteres
- Manter o design atual (dark theme, verde #00C853)

**1.6 — Criar use case `GetUserProfile`**
- Arquivo: `src/application/use-cases/GetUserProfile.ts`
- Busca perfil do SQLite local
- Se não encontrar, busca do Supabase e salva localmente

**1.7 — Testes unitários**
- Testar entidade UserProfile (validações)
- Testar use case GetUserProfile (com mock de repositório)
- Testar que signup salva perfil corretamente

---

## FASE 2 — Navegação com Tab Bar

### Motivação
Os wireframes mostram uma tab bar com 4 abas: Início, Treinos, Estatísticas, Perfil. A implementação atual usa apenas stack navigation linear.

### Tasks

**2.1 — Reestruturar navegação para Tabs + Stack**
- Converter `app/(app)/_layout.tsx` de Stack para Tabs (expo-router tabs)
- 4 abas: Início (`index`), Treinos (`history`), Estatísticas (`stats`), Perfil (`profile`)
- Ícones Ionicons: `home`, `barbell-outline`, `stats-chart`, `person-outline`
- Tab bar: background #1E1E1E, active tint #00C853, inactive tint #666
- Stack screens (active-workout, exercise-selector, exercise-input, workout/[id]) ficam FORA das tabs, como modais ou stack screens sobre as tabs

**2.2 — Criar tela de Perfil**
- Arquivo: `app/(app)/profile.tsx`
- Exibir: nome, email, avatar (placeholder se não tiver)
- Botão "Editar Perfil" (abre modal para editar nome)
- Botão "Sair" (logout)
- Manter design dark theme

**2.3 — Criar tela de Histórico de Treinos**
- Arquivo: `app/(app)/history.tsx`
- Lista completa de todos os treinos (não apenas última semana)
- Agrupados por mês/semana
- Card de treino com: data, grupos musculares, quantidade de exercícios, badge de sync
- Tap no card navega para `workout/[id]`

**2.4 — Criar tela de Estatísticas (placeholder)**
- Arquivo: `app/(app)/stats.tsx`
- Por enquanto, exibir dados básicos:
  - Total de treinos realizados
  - Total de exercícios registrados
  - Dias consecutivos treinando (streak)
  - Média de exercícios por treino
- Usar cards simples com os números
- Layout dark theme consistente

---

## FASE 3 — Home Screen Rica (Fidelidade ao Wireframe)

### Motivação
O wireframe da Home mostra: saudação personalizada com nome, calendário semanal visual, cards de treino ricos com grupos musculares e local. A implementação atual é básica.

### Tasks

**3.1 — Adicionar saudação personalizada**
- No topo da Home, exibir "Bom treino, {nome}!" usando o perfil do usuário
- Subtítulo "REPFORGE TRACKER"
- Avatar do usuário no canto superior direito (ou ícone placeholder)
- Buscar perfil via `GetUserProfile` use case

**3.2 — Implementar calendário semanal**
- Barra horizontal com os dias da semana (SEG a SAB/DOM)
- Ícone preenchido/destacado nos dias que tiveram treino
- Dia atual destacado em verde (#00C853)
- Dados vindos dos workouts da semana já carregados

**3.3 — Enriquecer cards de treino**
- Exibir no card: grupos musculares dos exercícios (ex: "Peito · Tríceps · Ombro")
- Quantidade de exercícios (ex: "5 exercícios")
- Nome do local se houver coordenadas (usar reverse geocoding com expo-location)
- Badge de sync: ícone de nuvem (synced) ou relógio (pending)
- Manter visual do wireframe: fundo #1E1E1E, borda esquerda verde

**3.4 — Criar use case `GetWeeklyWorkoutsSummary`**
- Retorna workouts da semana com dados agregados:
  - Grupos musculares (derivados dos exercícios)
  - Contagem de exercícios
  - Status de sync
- Busca workouts + workout_exercises + exercises do SQLite

**3.5 — Implementar reverse geocoding**
- Usar `expo-location.reverseGeocodeAsync()` para converter lat/long em nome do local
- Cachear resultado no SQLite (nova coluna `location_name` em workouts)
- Fallback: se falhar, mostrar apenas ícone de localização sem nome

---

## FASE 4 — Melhorias na Tela de Treino Ativo

### Motivação
O wireframe mostra cards de exercício mais ricos com fotos, botão editar, e nome do dia. A implementação atual é funcional mas simples.

### Tasks

**4.1 — Exibir título do treino com dia da semana**
- Header: "Treino de {dia_semana}" (ex: "Treino de Quinta")
- Subtítulo: "13 DE MARÇO DE 2026 · QUINTA-FEIRA"
- Timer verde no canto superior direito (já existe)

**4.2 — Enriquecer cards de exercício**
- Exibir thumbnail da foto capturada no card (se houver `media_url`)
- Badge de grupo muscular colorido
- Exibir "4 séries · 10 reps · 80 kg" formatado
- Botão "Editar" verde em cada card

**4.3 — Implementar edição de exercício**
- Ao tocar "Editar", abrir a tela de exercise-input preenchida com os dados atuais
- Permitir alterar séries, reps, peso e foto
- Criar use case `UpdateWorkoutExercise`
- Atualizar no SQLite e marcar sync_status como pending

**4.4 — Implementar remoção de exercício**
- Swipe-to-delete ou botão de lixeira no card
- Confirmação antes de remover
- Criar use case `RemoveExerciseFromWorkout`
- Remover do SQLite

**4.5 — Persistir duração do treino**
- Adicionar coluna `duration_seconds` (INTEGER) na tabela workouts
- Ao finalizar treino, salvar o tempo decorrido
- Exibir duração no detalhe do treino

---

## FASE 5 — Melhorias no Seletor e Input de Exercício

### Motivação
O wireframe mostra bottom sheet modal com badges de grupo muscular e steppers (+/-) para valores numéricos. A implementação usa tela full-screen e TextInputs simples.

### Tasks

**5.1 — Converter seletor para Bottom Sheet**
- Usar react-native-gesture-handler + react-native-reanimated para bottom sheet
- Ou usar @gorhom/bottom-sheet (verificar compatibilidade Expo)
- Abrir como modal parcial sobre a tela de treino ativo
- Manter busca por nome e grupo muscular

**5.2 — Adicionar badges de grupo muscular**
- Cada exercício na lista exibe badge colorido: "PEITO", "PERNAS", "COSTAS", etc.
- Cores distintas por grupo (verde, azul, laranja, etc.)
- Badge estilizado (borderRadius, padding, uppercase)

**5.3 — Implementar Stepper inputs**
- Substituir TextInput numérico por componente Stepper
- Layout: botão "-" | valor | botão "+"
- Campos: Séries (incremento 1), Reps (incremento 1), Carga/Peso (incremento 2.5 kg)
- Manter possibilidade de digitar valor diretamente ao tocar no número
- Criar componente reutilizável: `src/presentation/components/StepperInput.tsx`

**5.4 — Unificar seleção + input em um fluxo**
- Conforme wireframe: ao selecionar exercício, os steppers aparecem ABAIXO da lista no mesmo bottom sheet
- Botão "Salvar Exercício" no rodapé do bottom sheet
- Não navegar para tela separada

---

## FASE 6 — Melhorias na Tela de Detalhe do Treino

### Motivação
O wireframe mostra chips informativos, cards com badges e fotos, e botão para refazer treino. A implementação atual é simples.

### Tasks

**6.1 — Adicionar chips informativos**
- Abaixo do mapa, exibir chips horizontais:
  - "{N} exercícios"
  - "{MM} min" (duração)
  - "📍 {nome_local}" (se houver)
- Layout: Row com ScrollView horizontal, chips com fundo #1E1E1E e borda

**6.2 — Enriquecer cards de exercício no detalhe**
- Badge de grupo muscular colorido
- Exibir séries, reps, peso em layout tabular (como no wireframe)
- Thumbnail da foto (se houver) clicável para ver em tela cheia
- Botão "DETALHES" em cada card

**6.3 — Adicionar botão "INICIAR TREINO"**
- No rodapé da tela de detalhe
- Ao tocar, criar novo treino baseado nos mesmos exercícios (template)
- Criar use case `CloneWorkout`: copia exercícios do treino anterior para um novo treino ativo
- Navegar para active-workout com o novo treino

---

## FASE 7 — Sync Worker e Polish

### Tasks

**7.1 — Implementar useSyncWorker como hook dedicado**
- Arquivo: `src/presentation/hooks/useSyncWorker.ts`
- Montar no RootLayout
- Usar @react-native-community/netinfo para detectar conectividade
- Quando online: executar SyncWorkouts, SyncExerciseList, upload de mídias pendentes
- Retry silencioso, sem notificar o usuário de falhas
- Intervalo: a cada 30 segundos quando online

**7.2 — Sincronizar perfil do usuário**
- Adicionar UserProfile ao fluxo de sync
- Upload de avatar para Supabase Storage

**7.3 — Testes de apresentação**
- Testes para telas principais (Home, Active Workout, Workout Detail)
- Testes para hooks (useSyncWorker)
- Atingir meta de 70% coverage

---

## Regras Gerais para Todas as Fases

1. **Manter Clean Architecture**: entidades no domain, use cases no application, repositórios no infrastructure, telas e componentes no presentation
2. **Offline-first**: toda escrita vai para SQLite primeiro, sync em background
3. **Design system**: dark theme (#121212 background, #1E1E1E cards, #00C853 accent, #FFF text)
4. **TypeScript strict mode**: tipagem completa, sem `any`
5. **Testes**: toda entidade e use case novo deve ter teste unitário
6. **Ícones**: usar apenas @expo/vector-icons (Ionicons)
7. **Sem libs extras** não autorizadas: perguntar antes de adicionar dependências
8. **Expo Router**: manter file-based routing
9. **Português**: toda UI em pt-BR

## Ordem de Execução Recomendada

```
FASE 1 (Perfil) → FASE 2 (Tabs) → FASE 3 (Home Rica) → FASE 5 (Seletor/Input) → FASE 4 (Treino Ativo) → FASE 6 (Detalhe) → FASE 7 (Polish)
```

A Fase 1 é pré-requisito para a Fase 3 (saudação com nome). A Fase 2 é pré-requisito estrutural para as telas novas (Perfil, Histórico, Estatísticas). As demais podem ser paralelizadas.
