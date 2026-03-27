# user-auth

## Visão Geral

Gerencia o ciclo de vida da sessão do usuário: autenticação, persistência de sessão entre aberturas do app e logout. O usuário nunca deve ver conteúdo protegido sem uma sessão ativa válida.

## Regras e Invariantes

- O app MUST verificar a existência de uma sessão ativa imediatamente ao ser aberto, antes de renderizar qualquer tela protegida.
- Rotas protegidas (Home, ActiveWorkout, WorkoutDetail) MUST ser inacessíveis sem sessão ativa.
- Rotas de autenticação (Login, SignUp) MUST redirecionar para Home se o usuário já possuir sessão ativa.
- Mensagens de erro MUST ser amigáveis e MUST NOT expor detalhes técnicos (ex: códigos HTTP ou mensagens do servidor).
- O logout MUST invalidar a sessão localmente e redirecionar para Login imediatamente.
- O app MUST NOT solicitar login novamente enquanto a sessão persistida for válida.
- O app MUST permitir acesso ao conteúdo offline (dados do SQLite local) mesmo sem conectividade, desde que haja sessão ativa persistida.

## Cenários

### Cenário 1: Login com credenciais válidas
**Dado** que o usuário está na tela de Login e não possui sessão ativa  
**Quando** ele insere e-mail e senha corretos e confirma  
**Então** o sistema MUST autenticar e redirecionar para a tela Home

---

### Cenário 2: Login com credenciais inválidas
**Dado** que o usuário está na tela de Login  
**Quando** ele insere credenciais incorretas e confirma  
**Então** o sistema MUST exibir uma mensagem de erro clara e amigável abaixo do formulário  
**E** MUST NOT redirecionar o usuário

---

### Cenário 3: App aberto com sessão ativa
**Dado** que o usuário já fez login anteriormente e a sessão ainda é válida  
**Quando** ele abre o app  
**Então** o sistema MUST redirecionar diretamente para a Home, ignorando a tela de Login

---

### Cenário 4: App aberto sem sessão ativa
**Dado** que o usuário nunca fez login ou fez logout anteriormente  
**Quando** ele abre o app  
**Então** o sistema MUST exibir a tela de Login

---

### Cenário 5: App aberto offline com sessão ativa
**Dado** que o usuário tem uma sessão válida persistida localmente  
**Quando** ele abre o app sem conexão com a internet  
**Então** o sistema MUST permitir o acesso ao conteúdo cacheado localmente no SQLite  
**E** MUST NOT exibir a tela de Login nem bloquear a navegação

---

### Cenário 6: Cadastro de novo usuário
**Dado** que o usuário está na tela de Sign Up  
**Quando** ele preenche e-mail, senha e confirma  
**Então** o sistema MUST criar a conta, iniciar uma sessão e redirecionar para Home

---

### Cenário 7: Logout
**Dado** que o usuário está logado  
**Quando** ele aciona o logout  
**Então** o sistema MUST invalidar a sessão local e redirecionar para a tela de Login  
**E** MUST NOT manter dados de sessão em cache
