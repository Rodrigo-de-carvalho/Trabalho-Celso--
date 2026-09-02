# Sistema de Gestão — Clínica Odontológica

Trabalho conjunto entre as disciplinas de Desenvolvimento Back-End e Desenvolvimento Front-End, integrando banco de dados, API REST e interface web.

## Disciplinas e Professores

| Disciplina | Professor |
|------------|-----------|
| Desenvolvimento Back-End | Jailson |
| Desenvolvimento Front-End | Celso |

## Equipe

- Caio de Souza Vitorino
- Felipe Ferreira do Sacramento
- Felipe Nascimento Caldas
- Gabriel Coelho de Jesus Lopes
- Rodrigo de Carvalho Costa

## Arquitetura

```
[ React ]  --HTTP/JSON-->  [ Node.js + Express ]  --TypeORM/SQL-->  [ MySQL ]
 localhost:5173                localhost:8080                      localhost:3306
```

| Pasta | Camada | Tecnologia |
|-------|--------|------------|
| `/banco-de-dados` | Dados (9 tabelas) | MySQL |
| `/backend` | Regras de negócio (API REST) | TypeScript + Node.js + Express |
| `/frontend` | Interface web | React |

## Como rodar

**1. Banco de dados** — rode `banco-de-dados/schema.sql` no MySQL Workbench. Confirme com `SHOW TABLES;` (9 tabelas).

**2. Backend** — entre em `backend/`, copie o arquivo de exemplo de configuração, ajuste usuário/senha do MySQL nele e execute:
```bash
cp .env.example .env
npm install
npm run dev
```
API sobe em `http://localhost:8080`.

**3. Frontend** — entre em `frontend/` e execute:
```bash
npm install
npm start
```
Abre em `http://localhost:5173`.

## Organização do backend

O backend é escrito em **TypeScript** e dividido em camadas, cada uma com uma responsabilidade só:

| Pasta (`backend/src`) | O que faz |
|-----------------------|-----------|
| `entity/` | Classes que espelham as tabelas do banco (mapeadas com TypeORM) |
| `repository/` | Consultas ao banco (o que o TypeORM já traz + as consultas próprias do sistema) |
| `service/` | **Regras de negócio** — é onde as validações do trabalho ficam |
| `controller/` | Rotas da API: recebem a requisição HTTP e devolvem o JSON |
| `error/` | Tipos de erro e o tratador global que escolhe o status HTTP (400/404/409/500) |
| `config/` | Conexão com o banco (`data-source.ts`) e liberação do frontend (`cors.ts`) |

Comandos disponíveis em `backend/`:

| Comando | Para que serve |
|---------|----------------|
| `npm run dev` | Roda a API em modo desenvolvimento (reinicia sozinha ao salvar um arquivo) |
| `npm run typecheck` | Confere os tipos do TypeScript sem gerar arquivos |
| `npm run build` | Compila o TypeScript para JavaScript na pasta `dist/` |
| `npm start` | Roda a versão já compilada (`dist/`) |

## Regras de negócio implementadas

- CPF, e-mail e CRO únicos (erro 409 se duplicado)
- Sem dois agendamentos para o mesmo dentista no mesmo horário
- Valor da consulta calculado automaticamente (valor do procedimento − desconto do plano)
- Status do agendamento e forma de pagamento validados contra os valores aceitos (erro 400)
