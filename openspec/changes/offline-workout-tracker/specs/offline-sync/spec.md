# offline-sync

## Visão Geral

Define o comportamento de persistência local (offline-first) e a lógica de sincronização silenciosa em background com o Supabase. A UI nunca deve bloquear o usuário esperando por uma resposta de rede.

## Regras e Invariantes

- O SQLite MUST ser a fonte de verdade para todas as operações de leitura e escrita da UI.
- Toda operação de escrita (salvar treino, adicionar exercício) MUST ser gravada primeiro no SQLite, independentemente do estado da rede.
- Registros locais MUST ser marcados com `sync_status: pending` ao serem criados.
- A sincronização com o Supabase MUST ocorrer em background, sem bloquear ou exibir loading para o usuário.
- Em caso de falha na sincronização, o sistema MUST NOT exibir erro para o usuário e MUST manter o status `pending` para nova tentativa.
- Após sync bem-sucedido, o sistema MUST atualizar o `sync_status` do registro para `synced` no SQLite local.
- O catálogo de exercícios (Exercise Master List) MUST ser cacheado no SQLite após a primeira sincronização.

## Cenários

### Cenário 1: Salvar treino sem conexão
**Dado** que o dispositivo está offline  
**Quando** o usuário salva um treino ou adiciona um exercício  
**Então** o sistema MUST persistir todos os dados no SQLite local com `sync_status: pending`  
**E** MUST NOT exibir mensagem de erro ou bloqueio na UI

---

### Cenário 2: Sincronização ao recuperar conexão
**Dado** que o dispositivo estava offline e recuperou a conexão  
**Quando** a conectividade é detectada  
**Então** o sistema MUST iniciar silenciosamente a sincronização dos registros `pending` com o Supabase  
**E** MUST NOT interromper o fluxo do usuário com toasts, banners ou loadings

---

### Cenário 3: Sync bem-sucedido
**Dado** que a sincronização de um treino com o Supabase foi concluída  
**Quando** o upload é confirmado  
**Então** o sistema MUST atualizar o `sync_status` do registro local para `synced`  
**E** o badge do card correspondente na Home MUST refletir o novo status

---

### Cenário 4: Falha na sincronização
**Dado** que o sistema tentou sincronizar um registro com o Supabase  
**Quando** ocorre um erro (timeout, erro de servidor, sem resposta)  
**Então** o sistema MUST NOT alterar o `sync_status` do registro  
**E** MUST silenciosamente tentar novamente na próxima oportunidade de conectividade

---

### Cenário 5: Catálogo de exercícios vazio no primeiro acesso
**Dado** que o usuário acabou de se autenticar e o SQLite local não tem exercícios  
**Quando** a conexão está disponível  
**Então** o sistema MUST baixar o catálogo completo de exercícios do Supabase e armazená-lo no SQLite

---

### Cenário 6: Picker de exercícios sem catálogo local
**Dado** que o banco local ainda não possui o catálogo de exercícios (sync ainda não ocorreu)  
**Quando** o usuário abre o modal de adicionar exercício  
**Então** o sistema SHOULD exibir uma mensagem informando que nenhum exercício foi encontrado  
**E** MUST NOT travar ou crashar a aplicação
