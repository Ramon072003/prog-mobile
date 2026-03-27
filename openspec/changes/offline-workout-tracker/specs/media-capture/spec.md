# media-capture

## Visão Geral

Controla a captura de fotos por exercício dentro de um treino ativo, o gerenciamento do arquivo local e o upload assíncrono para o Storage do Supabase quando a conexão estiver disponível.

## Regras e Invariantes

- O sistema MUST solicitar permissão de câmera apenas no momento em que o usuário tenta usar a câmera (just-in-time), nunca na inicialização do app.
- Se o usuário nunca respondeu ao pedido de permissão, o sistema MUST exibir um modal explicativo antes de abrir a câmera.
- Se o usuário negou permanentemente a permissão, o sistema MUST exibir um modal orientando o usuário a alterar a permissão nas Configurações do SO.
- Após a captura, a foto MUST ser salva no diretório interno do app (não na galeria pública do dispositivo).
- O arquivo de mídia MUST NOT ser deletado antes de o upload ter sido concluído com sucesso.
- O `media_sync` do exercício MUST ser marcado como `pending` ao salvar o arquivo local.
- Após o upload bem-sucedido, o sistema MUST atualizar o `media_sync` para `uploaded` e registrar a URL pública no banco local.

## Cenários

### Cenário 1: Primeira solicitação de permissão de câmera
**Dado** que o usuário nunca concedeu nem negou a permissão de câmera  
**Quando** ele toca no ícone de câmera dentro do modal de adicionar exercício  
**Então** o sistema MUST exibir o diálogo nativo de solicitação de permissão  
**E** MUST NOT abrir a câmera antes da permissão ser concedida

---

### Cenário 2: Permissão de câmera concedida
**Dado** que a permissão de câmera foi concedida  
**Quando** o usuário toca no ícone de câmera  
**Então** o sistema MUST abrir a interface de câmera para captura

---

### Cenário 3: Permissão de câmera negada permanentemente
**Dado** que o usuário negou a permissão de câmera de forma permanente  
**Quando** ele toca no ícone de câmera  
**Então** o sistema MUST exibir um modal amigável explicando que a câmera está bloqueada  
**E** MUST oferecer um botão que abra as Configurações do sistema operacional  
**E** MUST NOT travar ou crashar a aplicação

---

### Cenário 4: Foto capturada com sucesso
**Dado** que a câmera está aberta e o usuário captura uma foto  
**Quando** a foto é confirmada  
**Então** o sistema MUST salvar o arquivo físico no diretório interno do app  
**E** MUST registrar o caminho local (URI) no banco SQLite com `media_sync: pending`

---

### Cenário 5: Upload de mídia em background
**Dado** que existem exercícios com `media_sync: pending` e a conexão está disponível  
**Quando** o sync worker executa  
**Então** o sistema MUST enviar o arquivo para o Supabase Storage via upload multipart  
**E** MUST atualizar o registro no SQLite com a URL pública e `media_sync: uploaded`

---

### Cenário 6: Upload falha por perda de conexão
**Dado** que o upload de uma mídia está em andamento  
**Quando** a conexão é perdida antes da conclusão  
**Então** o sistema MUST manter o arquivo local intacto  
**E** MUST manter o `media_sync: pending` para nova tentativa  
**E** MUST NOT exibir erro para o usuário
