## Why

Existem poucas opções de aplicativos de academia focados no essencial (projeto de aula) que funcionem de maneira robusta mesmo sem conexão com a internet. O Offline Workout Tracker resolve esse problema ao fornecer um aplicativo simples, intuitivo e com uma arquitetura "Offline-First", permitindo que o usuário registre seus treinos, tire fotos e capture geolocalização ininterruptamente, independentemente da qualidade da rede (como muitas vezes ocorre dentro de academias).

## What Changes

Criar um novo app Mobile do zero com Expo e React Native.
- Adição de Autenticação via Supabase (login e cadastro).
- Adição de suporte a armazenamento local via `expo-sqlite` servindo como Fonte de Verdade para o app, permitindo o funcionamento sem rede.
- Sincronização em background com Supabase Database (treinos, tabelas auxiliares) e Storage (fotos/vídeos).
- Adição de funcionalidades para registrar o treino (data, exercícios, séries, peso, repetições).
- Integração de listas pré-cadastradas de exercícios com pull down a partir do servidor para o SQLite local.
- Adição de suporte à câmera do dispositivo para anexos multimídia em cada dado do exercício (`expo-camera`).
- Adição de captura de geolocalização ao final do treino e visualização no final (`expo-location` e `react-native-maps`).
- Criação de interface do usuário focada em usabilidade e histórico (Login, Home/Weekly History, Active Workout e Exercise Details modal).

## Capabilities

### New Capabilities
- `user-auth`: Autenticação e gestão de usuários através do Supabase Auth.
- `workout-management`: Gerenciamento do ciclo de vida dos treinos (criação, edição e histórico semanal).
- `offline-sync`: Mecanismos de armazenamento local (SQLite) e sincronização em background tolerante a falhas com o Supabase.
- `media-capture`: Captura de fotos e vídeos offline e upload em background.
- `location-tracking`: Captura de geolocalização do momento de salvar o treino com exibição opcional em mapa.

### Modified Capabilities

## Impact

Essa mudança introduz toda a base arquitetural e de código do aplicativo. Envolve a configuração das bibliotecas base e a montagem das integrações nativas (Câmera, DB Local, Localização, Banco Remoto, etc).
