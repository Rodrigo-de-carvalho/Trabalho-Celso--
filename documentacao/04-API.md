# Rotas da API — PsiGestor

**Endereço base:** `http://localhost:8080/api`
**Formato:** JSON em todas as requisições e respostas.

## Autenticação

Exceto `POST /api/auth/login`, **todas** as rotas exigem o token no cabeçalho:

```
Authorization: Bearer <token>
```

O token é obtido no login, tem validade de 8 horas (configurável em `JWT_EXPIRACAO`) e é invalidado no logout.

## Códigos de status utilizados

| Código | Quando ocorre |
|---|---|
| `200 OK` | Consulta ou atualização bem-sucedida |
| `201 Created` | Registro criado |
| `400 Bad Request` | Dado inválido segundo as regras de negócio |
| `401 Unauthorized` | Sem token, token inválido/expirado, ou credenciais incorretas |
| `403 Forbidden` | Autenticado, mas o perfil não permite a operação |
| `404 Not Found` | Registro ou rota inexistente |
| `409 Conflict` | Duplicidade (e-mail, CRP, horário) ou transição de status inválida |
| `500 Internal Server Error` | Erro inesperado (a resposta **não** expõe o detalhe técnico) |

Todo erro retorna o mesmo formato:

```json
{ "mensagem": "Já existe um usuário cadastrado com este e-mail." }
```

---

## 1. Autenticação — `/api/auth`

| Método | Rota | Perfil | Objetivo |
|---|---|---|---|
| POST | `/api/auth/login` | público | Autenticar usuário |
| POST | `/api/auth/logout` | autenticado | Encerrar a sessão (invalida o token) |
| GET | `/api/auth/eu` | autenticado | Confere se a sessão ainda vale e devolve o perfil |

**POST `/api/auth/login`**

```json
// requisição
{ "email": "admin@psigestor.com", "senha": "admin123" }

// resposta 200
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "idUsuario": 1,
    "nomeCompleto": "Marina Alves Ribeiro",
    "email": "admin@psigestor.com",
    "perfil": "Administrador"
  }
}
```

> Por segurança, e-mail inexistente e senha errada devolvem **a mesma** mensagem (`E-mail ou senha inválidos`), para não revelar quais e-mails têm conta. Usuário `Inativo` ou `Bloqueado` recebe 401 com mensagem específica.

---

## 2. Painel — `/api/dashboard`

| Método | Rota | Perfil | Objetivo |
|---|---|---|---|
| GET | `/api/dashboard` | autenticado | Indicadores da tela inicial |

A resposta muda conforme o perfil: o administrador recebe também `usuarios` e `psicologos`; o psicólogo recebe apenas os números dos pacientes vinculados a ele.

```json
{
  "perfil": "Administrador",
  "usuarios": { "Ativo": 4, "Inativo": 1, "Bloqueado": 1, "total": 6 },
  "psicologos": { "total": 4 },
  "clientes": { "total": 6, "ativos": 5, "inativos": 1 },
  "agenda": {
    "total": 8, "agendados": 3, "confirmados": 2, "realizados": 1,
    "cancelados": 1, "faltas": 1,
    "taxaConfirmacao": 37.5, "taxaFalta": 50,
    "proximos": [ /* até 5 atendimentos */ ]
  }
}
```

---

## 3. Usuários — `/api/users`  *(exclusivo do Administrador)*

| Método | Rota | Objetivo |
|---|---|---|
| GET | `/api/users?situacao=Ativo&termo=marina` | Listar usuários, com filtro e busca |
| GET | `/api/users/perfis` | Listar os perfis disponíveis |
| GET | `/api/users/:id` | Consultar um usuário |
| POST | `/api/users` | Cadastrar usuário |
| PATCH | `/api/users/:id` | Atualizar dados, perfil, situação ou senha |

**POST `/api/users`**

```json
{
  "nomeCompleto": "Novo Psicólogo",
  "email": "novo@psigestor.com",
  "senha": "senha123",
  "perfil": { "idPerfil": 2 }
}
```

**PATCH `/api/users/:id`** — atualização **parcial**; envie somente o que mudou:

```json
{ "situacao": "Bloqueado" }        // ativar / inativar / bloquear
{ "perfil": { "idPerfil": 1 } }    // trocar o perfil de acesso
{ "senha": "novaSenha123" }        // redefinir a senha (nunca consultá-la)
```

> **Regra RN03:** alterar o **próprio** perfil ou a **própria** situação retorna `400`. É o que impede um usuário de se promover a administrador.

---

## 4. Psicólogos — `/api/psychologists`

| Método | Rota | Perfil | Objetivo |
|---|---|---|---|
| GET | `/api/psychologists` | autenticado | Listar psicólogos |
| GET | `/api/psychologists/eu` | Psicólogo | O próprio cadastro profissional |
| GET | `/api/psychologists/:id` | autenticado | Consultar um psicólogo |
| POST | `/api/psychologists` | Administrador | Cadastrar profissional |
| PATCH | `/api/psychologists/:id` | Administrador ou o próprio | Atualizar dados profissionais |

**POST `/api/psychologists`**

```json
{
  "usuario": { "idUsuario": 2 },
  "crp": "CRP 03/55555",
  "areaAtuacao": "Clínica",
  "abordagem": "Terapia Cognitivo-Comportamental",
  "telefone": "71988880009"
}
```

> O usuário informado precisa existir, ter o perfil `Psicologo` e ainda não ter cadastro profissional. Alterar o **CRP** é restrito ao administrador.

---

## 5. Clientes/Pacientes — `/api/patients`

| Método | Rota | Perfil | Objetivo |
|---|---|---|---|
| GET | `/api/patients?termo=ana&situacao=Ativo` | autenticado | Listar os **autorizados** |
| GET | `/api/patients/:id` | autenticado | Consultar registro autorizado |
| POST | `/api/patients` | autenticado | Cadastrar cliente/paciente |
| PATCH | `/api/patients/:id` | autenticado | Atualizar (inclusive ativar/inativar) |
| GET | `/api/patients/vinculos/psicologo/:idPsicologo` | Administrador | Vínculos de um psicólogo |
| POST | `/api/patients/vinculos` | Administrador | Vincular paciente a psicólogo |
| PATCH | `/api/patients/vinculos/:idVinculo/encerrar` | Administrador | Encerrar vínculo (não apaga) |

**POST `/api/patients`**

```json
{
  "nomeCompleto": "Paciente Fictício",
  "telefone": "71999990000",
  "dataNascimento": "1990-05-20",
  "email": "paciente@exemplo.com",
  "cidade": "Salvador",
  "estado": "BA",
  "observacoesAdministrativas": "Prefere atendimento online."
}
```

> **Regra RN05:** o psicólogo recebe apenas os pacientes com **vínculo ativo** com ele. Consultar o id de um paciente não vinculado retorna `403` — a permissão é conferida **antes** de dizer se o registro existe, para não revelar quais ids existem no banco.
>
> **Não existe `DELETE`.** Para desativar um cadastro, use `PATCH` com `{ "situacao": "Inativo" }` (RN07).

---

## 6. Atendimentos — `/api/appointments`  *(funcionalidade inovadora)*

| Método | Rota | Perfil | Objetivo |
|---|---|---|---|
| GET | `/api/appointments` | autenticado | Listar a agenda autorizada |
| GET | `/api/appointments/:id` | autenticado | Consultar um atendimento |
| POST | `/api/appointments` | autenticado | Agendar atendimento |
| PATCH | `/api/appointments/:id/confirmar` | autenticado | **Confirmar presença** |
| PATCH | `/api/appointments/:id` | autenticado | Mudar status, remarcar ou editar observações |

**POST `/api/appointments`**

```json
{
  "psicologo": { "idPsicologo": 1 },
  "cliente": { "idCliente": 1 },
  "dataHora": "2026-09-20T09:00",
  "duracaoMinutos": 50,
  "modalidade": "Online",
  "observacoes": "Sessão de acompanhamento."
}
```

> O campo `psicologo` é **ignorado** quando quem chama é um psicólogo: ele agenda sempre na própria agenda (RN15).

**Transições de status permitidas** (qualquer outra retorna `409`):

| De | Para |
|---|---|
| `Agendado` | `Confirmado`, `Cancelado`, `Realizado`, `Falta` |
| `Confirmado` | `Realizado`, `Cancelado`, `Falta` |
| `Realizado`, `Cancelado`, `Falta` | — (encerrados) |

---

## 7. Auditoria — `/api/audit-logs`  *(exclusivo do Administrador)*

| Método | Rota | Objetivo |
|---|---|---|
| GET | `/api/audit-logs?limite=200` | Listar as ações mais recentes (máx. 500) |

> Somente leitura: não há `POST`, `PATCH` nem `DELETE`. Registros de auditoria nunca são apagados.

---

## Resumo — correspondência com a API mínima sugerida no edital

| Rota sugerida no edital | Rota implementada | Situação |
|---|---|---|
| `POST /api/auth/login` | `POST /api/auth/login` | ✅ |
| `POST /api/auth/logout` | `POST /api/auth/logout` | ✅ |
| `GET /api/users` | `GET /api/users` | ✅ |
| `POST /api/users` | `POST /api/users` | ✅ |
| `PATCH /api/users/:id` | `PATCH /api/users/:id` | ✅ |
| `GET /api/psychologists` | `GET /api/psychologists` | ✅ |
| `POST /api/psychologists` | `POST /api/psychologists` | ✅ |
| `GET /api/patients` | `GET /api/patients` | ✅ |
| `POST /api/patients` | `POST /api/patients` | ✅ |
| `GET /api/patients/:id` | `GET /api/patients/:id` | ✅ |
| `PATCH /api/patients/:id` | `PATCH /api/patients/:id` | ✅ |
| `GET /api/audit-logs` | `GET /api/audit-logs` | ✅ |
| — | `GET /api/dashboard` | Acrescentada (indicadores) |
| — | `/api/appointments` (5 rotas) | Acrescentada (**inovação**) |
| — | `GET /api/auth/eu`, `GET /api/users/perfis`, `/api/patients/vinculos/*` | Acrescentadas (apoio) |
