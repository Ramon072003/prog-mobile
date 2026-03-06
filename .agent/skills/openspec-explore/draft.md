# Rascunho - Auth, BD e Fluxo Offline (Opção A)

## Decisões
1. **Opção A (Offline-First):** Salva no SQLite, tenta enviar pro Supabase. Fica "pendente" se offline.
2. **Exercícios Pré-cadastrados (Tabela `exercises`):** Lista inicial no app ou puxada do Supabase e salva no SQLite.
3. **Mídias Offline:** Salva a URI local no celular. Faz upload pro Supabase Storage quando a internet voltar e atualiza o registro com a URL do Storage.
4. **Geolocalização:** Mostra o mapinha visual (Expo MapView ou algo parecido, talvez integrado com Google Maps se no Android, ou nativo no iOS).

## Estrutura de Banco de Dados (Mental)

## Telas Principais
1. Tela Inicial (Resumo Semanal + Botão de Novo Treino)
2. Tela de Treino Ativo (Lista de exercícios + Adicionar Exercício + Concluir)
3. Modal/Screen: Adicionar Exercício (Dropdown, Reps, Peso, Foto/Vídeo)

## Próximos Passos Sugeridos
Tudo parece alinhado. Agora podemos criar uma proposta formal (OpenSpec Propose) para gerar a base do projeto.
## Fim do Explore
O usuário concordou com a stack e a arquitetura `Opção A`.
Próximo passo sugerido: Mudar para `/opsx-propose` e gerar tudo.
## Nova requisição do usuário
O usuário informou que deseja utilizar **Clean Architecture** e **DDD** neste projeto.
## Arquitetura Definida (Atualização)
- **Design Pattern:** Clean Architecture (foco em separação de responsabilidades).
- **Abordagem:** Interfaces para isolar SQLite/Supabase da UI (Repositories, Use Cases, Entities).
