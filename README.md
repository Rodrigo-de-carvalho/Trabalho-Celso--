# 🧠 PsiGestor — Plataforma de Gestão para Profissionais de Psicologia

**AV3 — Projeto Integrador** · UC Desenvolvimento Dinâmico · Centro Universitário Jorge Amado
Desenvolvimento de Sistemas com **TypeScript** e **MySQL** · Professor Msc. Celso Barreto

Sistema web que centraliza a gestão administrativa de profissionais de Psicologia: **controle de acesso por perfis**, cadastro de psicólogos e clientes/pacientes, **agenda com confirmação de atendimento** e **trilha de auditoria** — tudo persistido em MySQL.

## Equipe

- Caio de Souza Vitorino
- Felipe Ferreira do Sacramento
- Felipe Nascimento Caldas
- Gabriel Coelho de Jesus Lopes
- Rodrigo de Carvalho Costa

## Arquitetura

```
[ React + TypeScript ] --HTTP/JSON + token--> [ Node.js + TypeScript ] --TypeORM/SQL--> [ MySQL ]
    localhost:5173                                localhost:8080                        localhost:3306
```

| Pasta | Camada | Tecnologia |
|-------|--------|------------|
| `/banco-de-dados` | Dados (7 tabelas + seed fictício) | MySQL |
| `/backend` | Regras de negócio, API REST e segurança | Node.js + TypeScript + Express + TypeORM |
| `/frontend` | Interface web responsiva | React + TypeScript |
| `/documentacao` | Documentação completa do projeto | Markdown |

## Como rodar

**1. Banco de dados** — execute `banco-de-dados/schema.sql` no MySQL Workbench.
Confirme com `USE psigestor; SHOW TABLES;` (7 tabelas). O script já cria os dados fictícios de demonstração.

**2. Back-end**

```bash
cd backend
cp .env.example .env    # ajuste DB_USER, DB_PASSWORD e JWT_SECRET
npm install
npm run dev
```

API em `http://localhost:8080/api`.

**3. Front-end**

```bash
cd frontend
npm install
npm start
```

Abre em `http://localhost:5173`.

## Acessos de demonstração

> Dados inteiramente fictícios, criados apenas para a apresentação.

| E-mail | Senha | Perfil |
|---|---|---|
| `admin@psigestor.com` | `admin123` | Administrador |
| `bruno@psigestor.com` | `psi123` | Psicólogo (Clínica) |
| `carla@psigestor.com` | `psi123` | Psicólogo (Escolar) |
| `recepcao@psigestor.com` | `atend123` | Atendente |

## Funcionalidade inovadora — Agenda com confirmação

Cada atendimento percorre um ciclo de vida registrado no banco:

```
Agendado ──confirmar──► Confirmado ──► Realizado
    │                        │
    └──► Cancelado           └──► Falta
```

O sistema grava o momento exato da confirmação e, a partir daí, calcula a **taxa de confirmação** e a **taxa de faltas** exibidas no painel — informação que hoje se perde nas conversas de aplicativo de mensagens. Cada psicólogo vê os próprios números; o administrador vê os da clínica inteira.

## Perfis de acesso

| Perfil | Alcance |
|---|---|
| **Administrador** | Gerencia usuários, perfis, acessos, psicólogos, clientes/pacientes e vínculos; consulta a auditoria |
| **Psicólogo** | Acessa apenas os clientes/pacientes **vinculados a ele** e a própria agenda |
| **Atendente** | Cadastros e consultas administrativas, sem acesso à gestão de usuários nem à auditoria |

## Segurança

- Senhas protegidas com **hash bcrypt** — nunca armazenadas nem exibidas em texto puro; a coluna sequer é retornada pela API.
- Sessão com **token JWT**, invalidado de fato no logout.
- **Autorização validada no back-end** em toda rota — esconder o botão no front não é proteção.
- Psicólogo enxerga somente registros vinculados a ele (regra isolada em `service/acesso.ts`).
- Nenhum usuário pode alterar o próprio perfil ou a própria situação.
- Validação de entrada em todos os services; segredos em variáveis de ambiente (`.env`, fora do Git).
- Erros nunca expõem detalhes internos ou credenciais.
- Preferência por **inativação** em vez de exclusão; registros de auditoria não são apagáveis.

## Comandos disponíveis

**Back-end** (`cd backend`)

| Comando | Para que serve |
|---|---|
| `npm run dev` | Roda a API reiniciando sozinha ao salvar um arquivo |
| `npm test` | Executa os 17 testes automatizados (não precisa do MySQL) |
| `npm run typecheck` | Confere os tipos sem gerar arquivos |
| `npm run build` | Compila o TypeScript para `dist/` |
| `npm start` | Roda a versão compilada |

**Front-end** (`cd frontend`)

| Comando | Para que serve |
|---|---|
| `npm start` | Roda a interface em modo desenvolvimento |
| `npm run build` | Gera a versão otimizada para produção |

## Documentação

| Documento | Conteúdo |
|---|---|
| [01 — Documentação do projeto](documentacao/01-DOCUMENTACAO.md) | Contexto, requisitos, regras, casos de uso, arquitetura, inovação e conclusão |
| [02 — Diagrama ER](documentacao/02-DIAGRAMA-ER.md) | Modelo do banco, cardinalidades e restrições |
| [03 — Dicionário de dados](documentacao/03-DICIONARIO-DE-DADOS.md) | Todas as tabelas e colunas descritas |
| [04 — Rotas da API](documentacao/04-API.md) | Endpoints, exemplos e códigos de status |
| [05 — Testes](documentacao/05-TESTES.md) | Testes automatizados e roteiro de validação manual |
| [06 — Manual do usuário](documentacao/06-MANUAL-DO-USUARIO.md) | Instalação passo a passo e uso de cada tela |
