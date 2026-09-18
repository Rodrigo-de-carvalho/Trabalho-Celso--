# Plano e Resultados dos Testes — PsiGestor

## 1. Testes automatizados

Executados com o *test runner* nativo do Node.js (`node --test`), sem dependência de bibliotecas externas de teste.

```bash
cd backend
npm test
```

Os testes **não precisam do MySQL**: eles exercitam justamente as camadas que barram a requisição *antes* de ela chegar ao banco — segurança, autenticação, autorização, validação e tratamento de erros.

### 1.1 `src/testes/seguranca.test.ts` — hash de senha e token

| # | Teste | O que comprova |
|---|---|---|
| 1 | A senha nunca é guardada em texto puro | O hash não contém a senha e tem o formato bcrypt (60 caracteres, prefixo `$2`) |
| 2 | A senha correta é aceita e a errada é recusada | A verificação funciona nos dois sentidos |
| 3 | Dois hashes da mesma senha são diferentes | O *sal* aleatório impede identificar senhas iguais olhando o banco |
| 4 | O token guarda quem é o usuário e pode ser lido de volta | Id, e-mail e perfil trafegam corretamente |
| 5 | Um token adulterado é recusado | Trocar caracteres do token invalida a assinatura |
| 6 | Um token assinado com outro segredo é recusado | Sem conhecer o `JWT_SECRET` não é possível forjar acesso |

### 1.2 `src/testes/acesso.test.ts` — regra de privacidade

| # | Teste | O que comprova |
|---|---|---|
| 7 | Administrador enxerga qualquer cliente | Escopo "todos" funciona |
| 8 | Psicólogo enxerga apenas os vinculados | Paciente de outro profissional fica invisível |
| 9 | Acessar cliente não vinculado gera 403 | A regra bloqueia, não apenas esconde |
| 10 | Psicólogo sem cadastro profissional não vê ninguém | O padrão inseguro seria "ver tudo"; o sistema faz o oposto |

### 1.3 `src/testes/api.test.ts` — proteção das rotas (HTTP real)

| # | Teste | O que comprova |
|---|---|---|
| 11 | Nenhuma rota interna responde sem token | As 6 rotas protegidas retornam `401` |
| 12 | Token inválido é recusado | `401` |
| 13 | Psicólogo não acessa a área do administrador | `/users` e `/audit-logs` retornam `403` **mesmo com token válido** |
| 14 | Login sem e-mail ou senha responde `400` | Validação de entrada |
| 15 | A resposta de erro nunca expõe detalhes internos | Nenhum rastro de pilha, caminho de arquivo, "mysql" ou "senha" no corpo |
| 16 | Rota inexistente responde `404` em JSON | Tratamento uniforme |
| 17 | Id inválido no endereço responde `400` | `/api/patients/abc` não chega ao banco |
| 18 | O CORS libera os métodos que o front usa | `GET`, `POST` e `PATCH` passam na checagem prévia do navegador |

### Resultado da última execução

```
# tests 18
# pass 18
# fail 0
```

> O teste nº 13 é a evidência direta da regra **RN06** do edital: "a autorização deve ser validada no back-end, mesmo que o botão esteja oculto no front-end".

---

## 2. Verificações estáticas automatizadas

| Verificação | Comando | Resultado |
|---|---|---|
| Tipos do back-end | `cd backend && npm run typecheck` | Sem erros |
| Compilação do back-end | `cd backend && npm run build` | Sem erros |
| Tipos do front-end | `cd frontend && npx tsc --noEmit` | Sem erros |
| Build de produção do front-end | `cd frontend && npm run build` | Compilado com sucesso, sem *warnings* |

---

## 3. Testes manuais — roteiro de validação

Execute na ordem abaixo, com o banco criado pelo `schema.sql`.

### 3.1 Autenticação

| # | Passo | Resultado esperado |
|---|---|---|
| M01 | Acessar `http://localhost:5173/pacientes` sem estar logado | Redireciona para a tela de login |
| M02 | Entrar com `admin@psigestor.com` / `admin123` | Abre o painel do administrador |
| M03 | Entrar com senha errada | "E-mail ou senha inválidos" |
| M04 | Entrar com e-mail inexistente | **A mesma** mensagem do M03 |
| M05 | Entrar com `diego@psigestor.com` (Inativo) | "Seu acesso está inativo…" |
| M06 | Entrar com `fabio@psigestor.com` (Bloqueado) | "Seu acesso está bloqueado…" |
| M07 | Clicar em Sair e usar o botão "voltar" do navegador | Não entra: a sessão foi encerrada |
| M08 | Recarregar a página (F5) já logado | Continua logado, sem novo login |

### 3.2 Perfis e autorização

| # | Passo | Resultado esperado |
|---|---|---|
| M09 | Logar como psicólogo (`bruno@psigestor.com` / `psi123`) | O menu **não** mostra Usuários, Psicólogos nem Auditoria |
| M10 | Como psicólogo, digitar `/usuarios` na barra de endereços | Tela "Acesso negado" |
| M11 | Chamar `GET /api/users` com o token do psicólogo (Postman/`curl`) | `403 Forbidden` — **a proteção real está no back-end** |
| M12 | Como administrador, tentar bloquear a si mesmo | Botões desabilitados; via API, retorna `400` |

### 3.3 Gestão de usuários

| # | Passo | Resultado esperado |
|---|---|---|
| M13 | Cadastrar usuário com e-mail já existente | `409` — "Já existe um usuário cadastrado com este e-mail" |
| M14 | Cadastrar usuário com senha de 3 caracteres | `400` — mínimo de 6 caracteres |
| M15 | Bloquear um usuário e tentar logar com ele | Login recusado |
| M16 | Filtrar a lista por situação "Bloqueado" | Mostra apenas os bloqueados |
| M17 | Redefinir a senha de um usuário e logar com a nova | Login aceito; a senha antiga não funciona mais |
| M18 | Procurar em qualquer tela a senha de um usuário | **Não existe** — só é possível redefinir |

### 3.4 Clientes/pacientes e vínculos

| # | Passo | Resultado esperado |
|---|---|---|
| M19 | Como `bruno@psigestor.com`, listar os pacientes | Aparecem só Ana Beatriz e Helena (vinculadas a ele) |
| M20 | Como `carla@psigestor.com`, listar os pacientes | Aparecem só Caio e Júlia |
| M21 | Chamar `GET /api/patients/4` com o token do Bruno | `403` (paciente do Diego) |
| M22 | Buscar por "ana" na tela de pacientes | Filtra pelo nome |
| M23 | Inativar um paciente e filtrar por "Inativo" | Aparece na lista com a etiqueta cinza |
| M24 | Como administrador, vincular um paciente ao Bruno; depois logar como Bruno | O paciente agora aparece para ele |
| M25 | Encerrar o vínculo e recarregar como Bruno | O paciente deixa de aparecer, mas continua no banco |

### 3.5 Agenda com confirmação (inovação)

| # | Passo | Resultado esperado |
|---|---|---|
| M26 | Agendar atendimento para um paciente vinculado | Criado com status "Agendado" |
| M27 | Agendar no mesmo horário para o mesmo psicólogo | `409` — horário ocupado |
| M28 | Agendar para paciente não vinculado (via API) | `400` — "não está vinculado a este psicólogo" |
| M29 | Agendar para paciente inativo | `400` |
| M30 | Clicar em "Confirmar presença" | Status vira "Confirmado" e a coluna "Confirmado em" é preenchida |
| M31 | Tentar confirmar um atendimento já cancelado | `409` |
| M32 | Marcar um confirmado como "Realizado" e voltar ao Painel | A taxa de confirmação sobe |
| M33 | Registrar uma falta e voltar ao Painel | A taxa de faltas sobe; acima de 20% o indicador fica destacado |

### 3.6 Auditoria

| # | Passo | Resultado esperado |
|---|---|---|
| M34 | Fazer login e abrir a Auditoria | Existe um registro `LOGIN` com o nome do usuário e o horário |
| M35 | Bloquear um usuário e recarregar a Auditoria | Registro `ALTERAR_SITUACAO` com o detalhe "Nova situação: Bloqueado" |
| M36 | Errar a senha e conferir a Auditoria | Registro `LOGIN_NEGADO` |
| M37 | Procurar um botão de apagar registro | **Não existe**, nem na tela nem na API |

### 3.7 Responsividade

| # | Passo | Resultado esperado |
|---|---|---|
| M38 | Abrir o sistema em uma janela de 375px (modo dispositivo do navegador) | Menu vira faixa rolável; formulários passam a uma coluna |
| M39 | Abrir uma listagem no celular | A tabela rola na horizontal sem quebrar a página |
| M40 | Navegar apenas com a tecla Tab | Todos os campos e botões recebem contorno de foco visível |

---

## 4. Evidências

> **A preencher pelo grupo:** anexar as capturas de tela de cada fluxo principal
> (login, painel do administrador, gestão de usuários, painel do psicólogo com a
> lista restrita, agenda com a confirmação e auditoria), além da saída do
> comando `npm test`.
