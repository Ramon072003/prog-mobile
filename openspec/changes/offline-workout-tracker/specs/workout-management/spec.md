# workout-management

## Visão Geral

Gerencia o ciclo de vida completo de um treino: criação, adição e remoção de exercícios, conclusão e visualização do histórico semanal. É a capability central do app.

## Regras e Invariantes

- Um treino MUST ser criado com status `active` e `sync_status: pending` ao iniciar.
- Um treino ativo MUST pertencer ao usuário autenticado.
- Séries (`sets`), repetições (`reps`) e carga (`weight`) MUST ser valores numéricos maiores que zero.
- Um exercício MUST NOT ser adicionado ao treino sem que todos os três campos (sets, reps, weight) estejam preenchidos e válidos.
- O sistema MUST permitir remover um exercício de um treino ativo.
- Ao concluir um treino, o status MUST mudar de `active` para `completed`.
- A Home MUST exibir apenas os treinos da semana corrente.
- O sistema MUST NOT permitir que dois treinos estejam com status `active` simultaneamente.

## Cenários

### Cenário 1: Iniciar novo treino
**Dado** que o usuário está na Home  
**Quando** ele toca em "Iniciar Novo Treino"  
**Então** o sistema MUST criar uma sessão de treino com a data atual e status `active`  
**E** MUST navegar para a tela de Treino Ativo

---

### Cenário 2: Adicionar exercício com campos válidos
**Dado** que o usuário está na tela de Treino Ativo e abre o modal de adicionar exercício  
**Quando** ele seleciona um exercício e preenche sets, reps e weight com valores maiores que zero  
**Então** o sistema MUST vincular o exercício ao treino ativo no banco local  
**E** MUST exibir o exercício na lista da tela de Treino Ativo imediatamente

---

### Cenário 3: Tentar adicionar exercício com campos inválidos
**Dado** que o usuário está no modal de adicionar exercício  
**Quando** ele tenta confirmar com um ou mais campos vazios ou com valor zero  
**Então** o sistema MUST exibir uma mensagem de validação no campo inválido  
**E** MUST NOT adicionar o exercício ao treino

---

### Cenário 4: Estado vazio no treino ativo
**Dado** que o usuário está na tela de Treino Ativo sem nenhum exercício adicionado  
**Quando** a tela é exibida  
**Então** o sistema MUST mostrar uma mensagem guia incentivando adicionar o primeiro exercício  
**E** MUST NOT exibir uma lista vazia sem orientação

---

### Cenário 5: Concluir treino
**Dado** que o usuário está na tela de Treino Ativo com ao menos um exercício adicionado  
**Quando** ele toca em "Concluir Treino"  
**Então** o sistema MUST atualizar o status do treino para `completed`  
**E** MUST navegar para a tela de Detalhes do Treino via `router.replace`

---

### Cenário 6: Home com treinos na semana
**Dado** que o usuário tem treinos concluídos na semana corrente  
**Quando** ele abre a Home  
**Então** o sistema MUST exibir um card por treino com data, grupos musculares e badge de sync

---

### Cenário 7: Home sem treinos na semana
**Dado** que o usuário não tem nenhum treino registrado na semana corrente  
**Quando** ele abre a Home  
**Então** o sistema MUST exibir um estado vazio com mensagem encorajadora  
**E** MUST exibir o botão "Iniciar Novo Treino" em destaque

---

### Cenário 8: Visualizar detalhes de um treino concluído
**Dado** que o usuário está na Home e vê um card de treino passado  
**Quando** ele toca no card  
**Então** o sistema MUST navegar para a tela de Detalhes exibindo: data, lista de exercícios (com sets, reps, peso, foto thumbnail se disponível) e mapa (se coordenadas disponíveis)

---

### Cenário 9: Badge de sync no card de treino
**Dado** que o usuário está na Home e um treino tem `sync_status: pending`  
**Quando** o card é renderizado  
**Então** o sistema MUST exibir um ícone visual de pendente no card  
**E** quando o status for `synced`, MUST exibir um ícone de confirmação
