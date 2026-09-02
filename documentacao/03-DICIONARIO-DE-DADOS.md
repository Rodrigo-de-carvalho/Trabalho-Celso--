# Dicionário de Dados — PsiGestor

Banco: **`psigestor`** · Charset: `utf8mb4` · Collation: `utf8mb4_unicode_ci`
Script de criação: [`banco-de-dados/schema.sql`](../banco-de-dados/schema.sql)

Legenda: **PK** chave primária · **FK** chave estrangeira · **UK** valor único · **NN** não nulo

---

## 1. `perfis` — Perfis de acesso

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id_perfil` | INT AUTO_INCREMENT | PK | Identificador do perfil |
| `nome` | VARCHAR(30) | NN, UK | Administrador, Psicologo ou Atendente |
| `descricao` | VARCHAR(255) | NN | O que o perfil pode fazer |

## 2. `usuarios` — Quem acessa a plataforma

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id_usuario` | INT AUTO_INCREMENT | PK | Identificador do usuário |
| `nome_completo` | VARCHAR(100) | NN | Nome exibido no sistema |
| `email` | VARCHAR(100) | NN, UK | Login do usuário |
| `senha_hash` | VARCHAR(255) | NN | **Hash bcrypt** da senha. Nunca em texto puro e nunca devolvido pela API |
| `id_perfil` | INT | NN, FK → `perfis` | Perfil de acesso |
| `situacao` | ENUM | NN, padrão `Ativo` | `Ativo` (pode entrar), `Inativo`, `Bloqueado` |
| `data_cadastro` | TIMESTAMP | NN, padrão agora | Quando o usuário foi criado |
| `ultimo_acesso` | DATETIME | nulo | Data/hora do último login bem-sucedido |

## 3. `psicologos` — Dados profissionais

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id_psicologo` | INT AUTO_INCREMENT | PK | Identificador do psicólogo |
| `id_usuario` | INT | NN, UK, FK → `usuarios` | Usuário correspondente (relação 1:1) |
| `crp` | VARCHAR(20) | NN, UK | Registro no Conselho Regional de Psicologia |
| `area_atuacao` | ENUM | NN | Clínica, Organizacional e do Trabalho, Escolar e Educacional, Hospitalar, Social, Jurídica, Do Esporte, Do Trânsito, Neuropsicologia, Pesquisa e Docência |
| `abordagem` | VARCHAR(100) | nulo | Abordagem teórica (ex: TCC) |
| `telefone` | VARCHAR(15) | nulo | Contato profissional |

## 4. `clientes_pacientes` — Pessoas atendidas

> Apenas dados **administrativos**. Conteúdo clínico de sessão não é armazenado.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id_cliente` | INT AUTO_INCREMENT | PK | Identificador do cliente/paciente |
| `nome_completo` | VARCHAR(100) | NN | Nome |
| `data_nascimento` | DATE | nulo | Usada para calcular a idade na listagem |
| `email` | VARCHAR(100) | nulo | Contato |
| `telefone` | VARCHAR(15) | NN | Contato principal |
| `cidade` | VARCHAR(50) | nulo | Cidade |
| `estado` | CHAR(2) | nulo | UF |
| `situacao` | ENUM | NN, padrão `Ativo` | `Ativo` ou `Inativo` (preferimos inativar a excluir) |
| `observacoes_administrativas` | TEXT | nulo | Anotações de gestão (ex: preferência de horário) |
| `id_usuario_cadastro` | INT | nulo, FK → `usuarios` | Quem cadastrou (rastreabilidade) |
| `data_cadastro` | TIMESTAMP | NN, padrão agora | Data do cadastro |

## 5. `vinculos` — Quem atende quem

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id_vinculo` | INT AUTO_INCREMENT | PK | Identificador do vínculo |
| `id_psicologo` | INT | NN, FK → `psicologos` | Profissional responsável |
| `id_cliente` | INT | NN, FK → `clientes_pacientes` | Pessoa atendida |
| `data_inicio` | DATE | NN | Início do acompanhamento |
| `data_fim` | DATE | nulo | Encerramento (preenchido ao encerrar) |
| `ativo` | BOOLEAN | NN, padrão TRUE | **É esta coluna que define o que o psicólogo enxerga** |

Restrição adicional: `UNIQUE (id_psicologo, id_cliente)`.

## 6. `atendimentos` — Agenda com confirmação *(entidade da inovação)*

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id_atendimento` | INT AUTO_INCREMENT | PK | Identificador do atendimento |
| `id_psicologo` | INT | NN, FK → `psicologos` | Dono da agenda |
| `id_cliente` | INT | NN, FK → `clientes_pacientes` | Pessoa atendida |
| `data_hora` | DATETIME | NN | Quando o atendimento acontece |
| `duracao_minutos` | INT | NN, padrão 50 | Duração prevista (10 a 240) |
| `modalidade` | ENUM | NN, padrão `Presencial` | `Presencial` ou `Online` |
| `status` | ENUM | NN, padrão `Agendado` | `Agendado`, `Confirmado`, `Realizado`, `Cancelado`, `Falta` |
| `confirmado_em` | DATETIME | nulo | Momento da confirmação de presença |
| `observacoes` | TEXT | nulo | Anotações administrativas |
| `data_criacao` | TIMESTAMP | NN, padrão agora | Quando foi agendado |

Restrição adicional: `UNIQUE (id_psicologo, data_hora)`.

## 7. `logs_acoes` — Auditoria

> Tabela somente de leitura pela aplicação: não existe rota de exclusão.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id_log` | INT AUTO_INCREMENT | PK | Identificador do registro |
| `id_usuario` | INT | nulo, FK → `usuarios` | Quem executou (nulo = ação do sistema) |
| `acao` | VARCHAR(60) | NN | LOGIN, LOGOUT, LOGIN_NEGADO, CRIAR, ATUALIZAR, ALTERAR_SITUACAO, ALTERAR_PERFIL, REDEFINIR_SENHA, VINCULAR, DESVINCULAR, CONFIRMAR |
| `entidade` | VARCHAR(40) | NN | Tabela afetada |
| `id_entidade` | INT | nulo | Id do registro afetado |
| `detalhes` | VARCHAR(255) | nulo | Descrição legível da operação |
| `data_hora` | TIMESTAMP | NN, padrão agora | Quando aconteceu |

---

## Dados fictícios de demonstração (seed)

| Tabela | Registros |
|---|---|
| `perfis` | 3 |
| `usuarios` | 6 (1 administrador, 4 psicólogos, 1 atendente — com um inativo e um bloqueado) |
| `psicologos` | 4 |
| `clientes_pacientes` | 6 (5 ativos, 1 inativo) |
| `vinculos` | 6 (5 ativos, 1 encerrado) |
| `atendimentos` | 8 (cobrindo os cinco status) |
| `logs_acoes` | 6 |

**Credenciais de demonstração** (senhas fictícias, apenas para a apresentação):

| E-mail | Senha | Perfil |
|---|---|---|
| `admin@psigestor.com` | `admin123` | Administrador |
| `bruno@psigestor.com` | `psi123` | Psicólogo (Clínica) |
| `carla@psigestor.com` | `psi123` | Psicólogo (Escolar) |
| `diego@psigestor.com` | `psi123` | Psicólogo — **Inativo** (demonstra o bloqueio de login) |
| `fabio@psigestor.com` | `psi123` | Psicólogo — **Bloqueado** |
| `recepcao@psigestor.com` | `atend123` | Atendente |
