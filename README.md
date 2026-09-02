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
[ React ]  --HTTP/JSON-->  [ Spring Boot ]  --JPA/SQL-->  [ MySQL ]
 localhost:5173              localhost:8080                localhost:3306
```

| Pasta | Camada | Tecnologia |
|-------|--------|------------|
| `/banco-de-dados` | Dados (9 tabelas) | MySQL |
| `/backend` | Regras de negócio (API REST) | Java + Spring Boot |
| `/frontend` | Interface web | React |

## Como rodar

**1. Banco de dados** — rode `banco-de-dados/schema.sql` no MySQL Workbench. Confirme com `SHOW TABLES;` (9 tabelas).

**2. Backend** — ajuste usuário/senha do MySQL em `backend/src/main/resources/application.properties` e execute:
```bash
mvn spring-boot:run
```
API sobe em `http://localhost:8080`.

**3. Frontend** — execute:
```bash
npm install
npm start
```
Abre em `http://localhost:5173`.

## Regras de negócio implementadas

- CPF, e-mail e CRO únicos (erro 409 se duplicado)
- Sem dois agendamentos para o mesmo dentista no mesmo horário
- Valor da consulta calculado automaticamente (valor do procedimento − desconto do plano)
