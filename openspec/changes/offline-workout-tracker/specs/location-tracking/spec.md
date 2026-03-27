# location-tracking

## Visão Geral

Captura as coordenadas geográficas do usuário no momento em que ele conclui um treino. A localização é opcional e não deve nunca bloquear a conclusão do treino caso a permissão seja negada ou o GPS esteja indisponível.

## Regras e Invariantes

- O sistema MUST solicitar permissão de localização apenas no momento da conclusão do treino (just-in-time), nunca na inicialização do app.
- A negação da permissão MUST NOT bloquear a conclusão do treino.
- O sistema MUST NOT exibir mensagem de erro quando a localização não estiver disponível ou for negada.
- Quando disponível, as coordenadas MUST ser salvas junto ao treino no SQLite local.
- O mapa na tela de Detalhes MUST ser exibido apenas quando o treino tiver coordenadas registradas.
- O sistema MUST NOT renderizar nenhum placeholder ou mensagem de erro caso não haja coordenadas.

## Cenários

### Cenário 1: Primeira solicitação de permissão ao concluir treino
**Dado** que o usuário nunca concedeu nem negou a permissão de localização  
**Quando** ele toca em "Concluir Treino"  
**Então** o sistema MUST solicitar a permissão de localização em primeiro plano  
**E** MUST exibir uma breve justificativa amigável sobre o uso das coordenadas

---

### Cenário 2: Permissão de localização concedida
**Dado** que o usuário concedeu a permissão de localização  
**Quando** ele toca em "Concluir Treino"  
**Então** o sistema MUST capturar a latitude e longitude atuais  
**E** MUST salvar as coordenadas junto ao registro do treino no SQLite local

---

### Cenário 3: Permissão de localização negada
**Dado** que o usuário negou a permissão de localização  
**Quando** ele toca em "Concluir Treino"  
**Então** o sistema MUST concluir o treino normalmente sem coordenadas  
**E** MUST NOT exibir mensagem de erro, modal de bloqueio ou aviso  
**E** MUST navegar para a tela de Detalhes do Treino normalmente

---

### Cenário 4: GPS indisponível ao concluir treino
**Dado** que a permissão foi concedida mas o sinal de GPS está indisponível  
**Quando** o sistema tenta capturar as coordenadas  
**Então** o sistema MUST concluir o treino sem coordenadas  
**E** MUST NOT bloquear a navegação nem exibir erro para o usuário

---

### Cenário 5: Exibição do mapa no detalhe do treino (com coordenadas)
**Dado** que o usuário está visualizando os detalhes de um treino que possui latitude e longitude  
**Quando** a tela de WorkoutDetail é carregada  
**Então** o sistema MUST renderizar um componente de mapa com um marcador no ponto registrado  
**E** MUST exibir um indicador de carregamento enquanto os tiles do mapa estiverem sendo baixados

---

### Cenário 6: Exibição do detalhe do treino sem coordenadas
**Dado** que o usuário está visualizando os detalhes de um treino sem coordenadas (permissão negada ou GPS indisponível)  
**Quando** a tela de WorkoutDetail é carregada  
**Então** o sistema MUST NOT renderizar o componente de mapa  
**E** MUST NOT exibir placeholder, ícone vazio ou mensagem de erro relacionada à localização
