# PsiGestor — Documentação do Projeto

**Centro Universitário Jorge Amado — UC Desenvolvimento Dinâmico**
**AV3 — Projeto Integrador: Desenvolvimento de Sistemas com TypeScript e MySQL**
**Professor:** Msc. Celso Barreto

| | |
|---|---|
| **Produto** | PsiGestor — Plataforma de Gestão para Profissionais de Psicologia |
| **Turma** | *(preencher)* |
| **Data** | *(preencher)* |

**Integrantes:**

- Caio de Souza Vitorino
- Felipe Ferreira do Sacramento
- Felipe Nascimento Caldas
- Gabriel Coelho de Jesus Lopes
- Rodrigo de Carvalho Costa

> **Documentos complementares:** [Diagrama ER](02-DIAGRAMA-ER.md) · [Dicionário de Dados](03-DICIONARIO-DE-DADOS.md) · [Rotas da API](04-API.md) · [Testes](05-TESTES.md) · [Manual do Usuário](06-MANUAL-DO-USUARIO.md)

---

## 1. Resumo do produto

O **PsiGestor** é uma aplicação web para organizações que reúnem profissionais de Psicologia. Ele centraliza, em um único sistema com controle de acesso, três coisas que hoje ficam espalhadas em planilhas, agendas pessoais e aplicativos de mensagens: **quem pode usar o sistema**, **quais clientes/pacientes existem e de quem são** e **o que foi agendado, confirmado e realizado**.

O produto é composto por uma interface web responsiva em React + TypeScript, uma API REST em Node.js + TypeScript e um banco de dados MySQL. O acesso é controlado por login com senha protegida por hash e por três perfis (Administrador, Psicólogo e Atendente), e toda operação relevante fica registrada em uma trilha de auditoria.

---

## 2. Contexto e situação-problema

Profissionais de Psicologia atuam em contextos muito diferentes — Clínica, Organizacional, Escolar, Hospitalar, Social, Jurídica, do Esporte, do Trânsito, Neuropsicologia, pesquisa e docência. Apesar dessas diferenças, enfrentam dificuldades semelhantes na organização de clientes, agenda, atendimentos e informações administrativas.

Quando esses dados ficam distribuídos em planilhas, agendas pessoais e conversas de aplicativos de mensagens, surgem quatro problemas concretos:

1. **Retrabalho** — o mesmo cadastro é digitado em vários lugares.
2. **Falta de rastreabilidade** — ninguém sabe quem alterou o quê, nem quando.
3. **Controle de acesso inexistente** — não há como determinar quem pode ver o quê.
4. **Risco de acesso indevido** a dados pessoais e sensíveis.

**Problema a resolver:** como desenvolver uma plataforma segura, organizada e flexível que centralize a gestão dos profissionais de Psicologia e de seus clientes/pacientes, com controle de acesso, persistência em MySQL e integração completa entre front-end e back-end?

---

## 3. Objetivos

### Objetivo geral

Desenvolver um produto de software web, funcional e demonstrável, que centralize a gestão administrativa de profissionais de Psicologia e de seus clientes/pacientes, com autenticação, perfis de acesso e persistência real em MySQL.

### Objetivos específicos

- Implementar autenticação com senha protegida por hash e sessão baseada em token.
- Implementar três perfis de acesso com permissões distintas, validadas no back-end.
- Construir um painel administrativo com indicadores e gestão de usuários (ativar, inativar, bloquear, liberar, definir perfil).
- Permitir o cadastro e a consulta de psicólogos e de clientes/pacientes, com busca e filtros.
- Garantir que cada psicólogo enxergue apenas os clientes/pacientes vinculados a ele.
- Registrar as operações relevantes em uma trilha de auditoria consultável.
- Entregar uma funcionalidade inovadora: agenda com confirmação de atendimento e indicadores derivados dela.
- Documentar arquitetura, banco, API, instalação, testes e uso.

---

## 4. Público-alvo e perfis de acesso

**Público-alvo:** organizações (clínicas, consultórios compartilhados, serviços-escola, departamentos de RH, instituições de ensino) que reúnem profissionais de Psicologia de qualquer área de atuação e precisam de controle administrativo centralizado.

O sistema não impõe um modelo de atendimento: ele organiza a camada **administrativa**, comum a todas as áreas da Psicologia.

| Perfil | O que pode fazer | Limites |
|---|---|---|
| **Administrador** | Gerencia usuários, perfis e permissões; ativa, inativa, bloqueia e libera acessos; redefine senhas; cadastra psicólogos e clientes/pacientes; cria e encerra vínculos; consulta a auditoria; acessa a agenda de toda a clínica. | Não visualiza senhas (só redefine); não remove registros de auditoria; **não altera o próprio perfil nem a própria situação**. |
| **Psicólogo** | Acessa o próprio painel; consulta e atualiza os clientes/pacientes **vinculados a ele**; gerencia a própria agenda e confirma atendimentos; atualiza o próprio cadastro profissional. | Não vê pacientes de outros profissionais; não acessa a gestão de usuários nem a auditoria; não altera o próprio CRP. |
| **Atendente** *(opcional, implementado)* | Cadastra e consulta clientes/pacientes; agenda atendimentos para os psicólogos. | Não acessa a gestão de usuários nem a auditoria. |

> **Nota sobre privacidade:** o sistema registra apenas dados **administrativos** dos clientes/pacientes (nome, contato, situação, vínculo, agenda). Conteúdo clínico de sessão não é armazenado, por ser informação sigilosa e não necessária à gestão.

---

## 5. Requisitos

### 5.1 Requisitos funcionais

| ID | Requisito | Onde está implementado |
|---|---|---|
| RF01 | Login com e-mail e senha | `AuthService.login` · tela `Login.tsx` |
| RF02 | Logout com invalidação do token | `AuthService.logout` |
| RF03 | Proteção de todas as rotas internas | `middleware/autenticacao.ts` · `RotaProtegida.tsx` |
| RF04 | Identificação do perfil após o login e redirecionamento ao painel | `contexto/Autenticacao.tsx` · `App.tsx` |
| RF05 | Mensagens adequadas para credenciais inválidas e acesso negado | `AuthService` · `tratador-de-erros.ts` |
| RF06 | Painel com quantidade de usuários, psicólogos e clientes/pacientes | `PainelService` · `Painel.tsx` |
| RF07 | Listar usuários por situação (ativo, inativo, bloqueado) | `UsuarioService.listar` · `Usuarios.tsx` |
| RF08 | Cadastrar, consultar, editar, ativar, bloquear e liberar usuários | `UsuarioService` · `Usuarios.tsx` |
| RF09 | Definir o perfil de acesso de cada usuário | `UsuarioService.atualizar` |
| RF10 | Cadastrar e gerenciar psicólogos | `PsicologoService` · `Psicologos.tsx` |
| RF11 | Cadastrar e gerenciar clientes/pacientes | `ClientePacienteService` · `Pacientes.tsx` |
| RF12 | Consultar registros de ações (auditoria) | `LogService` · `Auditoria.tsx` |
| RF13 | Psicólogo visualiza e atualiza o próprio perfil | `PsicologoService` · `MeuPerfil.tsx` |
| RF14 | Psicólogo consulta os clientes/pacientes vinculados | `acesso.ts` · `ClientePacienteService.listar` |
| RF15 | Pesquisar por nome e filtrar por situação | `ClientePacienteService.listar` · `Pacientes.tsx` |
| RF16 | Vincular cliente/paciente a um psicólogo | `ClientePacienteService.vincular` · `Psicologos.tsx` |
| RF17 | Ativar e inativar registros de clientes/pacientes | `ClientePacienteService.atualizar` |
| RF18 | **Inovação:** agendar atendimento, confirmar presença e acompanhar o status | `AtendimentoService` · `Agenda.tsx` |
| RF19 | **Inovação:** painel de indicadores (taxa de confirmação e de faltas) | `PainelService` · `Painel.tsx` |

### 5.2 Requisitos não funcionais

| ID | Requisito | Como foi atendido |
|---|---|---|
| RNF01 | Back-end em Node.js com TypeScript | Node 22 + Express + TypeORM, 100% TypeScript em modo `strict` |
| RNF02 | Banco relacional MySQL | 7 tabelas com PK, FK, `UNIQUE`, `ENUM` e índices |
| RNF03 | Interface web responsiva | CSS com Grid/Flexbox e *media queries* (780px e 460px) |
| RNF04 | Senha protegida por hash | bcrypt com 10 rodadas; coluna nunca retornada pela API |
| RNF05 | Autorização validada no back-end | Middleware `autorizar` + verificação de escopo nos services |
| RNF06 | Validação de entrada | Todos os services validam antes de gravar |
| RNF07 | Uso de variáveis de ambiente | Arquivo `.env` (fora do Git); a aplicação não sobe sem `JWT_SECRET` |
| RNF08 | Tratamento de erros | Tratador global com 400/401/403/404/409/500; erro 500 não expõe detalhe técnico |
| RNF09 | Código versionado | Git com histórico de commits |
| RNF10 | Testes automatizados | 18 testes com o *test runner* nativo do Node |
| RNF11 | Organização em camadas | `entity` / `repository` / `service` / `controller` / `middleware` / `error` / `config` |

---

## 6. Regras de negócio

| ID | Regra | Onde é garantida |
|---|---|---|
| RN01 | Somente usuário autenticado acessa páginas internas | `autenticar` (401) |
| RN02 | Somente o administrador ativa, bloqueia, libera usuários e altera perfis | `autorizar('Administrador')` (403) |
| RN03 | **Nenhum usuário pode elevar a própria permissão** | `UsuarioService.atualizar` recusa alterar o próprio perfil/situação (400) |
| RN04 | Senhas nunca são exibidas nem armazenadas em texto puro | `select: false` na coluna + hash bcrypt |
| RN05 | Psicólogos veem apenas os registros vinculados a eles | `acesso.ts` (`obterEscopo`), aplicado em todos os services |
| RN06 | A autorização é validada no back-end, mesmo com o botão oculto no front | Middleware + services; testes automatizados comprovam |
| RN07 | Prefere-se inativação a exclusão | Não existe rota `DELETE` para usuários, pacientes, vínculos ou logs |
| RN08 | Cadastros e alterações são validados antes da gravação | Validações em cada service |
| RN09 | Erros não expõem detalhes internos nem credenciais | Erro 500 devolve mensagem genérica; detalhe só no log do servidor |
| RN10 | Todos os dados de demonstração são fictícios | `schema.sql` (seed) |
| RN11 | E-mail de usuário e CRP de psicólogo são únicos | `UNIQUE` no banco + verificação no service (409) |
| RN12 | Um psicólogo não tem dois atendimentos no mesmo horário | `UNIQUE (id_psicologo, data_hora)` + verificação no service (409) |
| RN13 | Só se agenda para paciente ativo e vinculado ao psicólogo | `AtendimentoService.criar` (400) |
| RN14 | O status do atendimento segue transições válidas | Tabela `TRANSICOES_PERMITIDAS` (409) |
| RN15 | O psicólogo agenda somente na própria agenda | `resolverPsicologo` ignora o id enviado pelo cliente |

---

## 7. Casos de uso / histórias de usuário

**UC01 — Entrar no sistema.** *Como usuário, quero entrar com e-mail e senha para acessar o painel do meu perfil.*
Fluxo principal: informa credenciais → sistema confere o hash → gera token → redireciona ao painel.
Fluxos alternativos: credenciais inválidas → mensagem genérica ("E-mail ou senha inválidos"); usuário inativo/bloqueado → mensagem específica orientando procurar o administrador.

**UC02 — Gerenciar acessos.** *Como administrador, quero ativar, inativar ou bloquear usuários para controlar quem entra no sistema.*
Fluxo: abre Usuários → filtra por situação → aciona Liberar/Inativar/Bloquear → sistema grava e registra na auditoria.
Restrição: o próprio usuário logado aparece com os botões desabilitados (RN03).

**UC03 — Cadastrar psicólogo.** *Como administrador, quero cadastrar o profissional a partir de um usuário existente.*
Fluxo: cria o usuário com perfil "Psicologo" → abre Psicólogos → seleciona o usuário → informa CRP e área → salva.

**UC04 — Vincular paciente a psicólogo.** *Como administrador, quero definir quem atende quem, controlando o que cada profissional enxerga.*
Fluxo: Psicólogos → Gerenciar vínculos → seleciona o paciente → Vincular. O encerramento marca o vínculo como inativo, sem apagá-lo.

**UC05 — Consultar meus pacientes.** *Como psicólogo, quero ver apenas os meus pacientes.*
Fluxo: abre Clientes/Pacientes → o back-end filtra pelo vínculo ativo antes de responder.

**UC06 — Agendar e confirmar atendimento (inovação).** *Como psicólogo, quero registrar a confirmação de presença para acompanhar minha taxa de faltas.*
Fluxo: Agenda → preenche paciente, data/hora e modalidade → Agendar (status "Agendado") → Confirmar presença (status "Confirmado", grava `confirmado_em`) → após a sessão, Marcar realizado ou Registrar falta.

**UC07 — Consultar auditoria.** *Como administrador, quero saber quem fez o quê e quando.*
Fluxo: abre Auditoria → filtra por ação, usuário ou registro. Tela somente leitura.

---

## 8. Arquitetura da solução

```
┌────────────────────┐   HTTP/JSON + Bearer token   ┌─────────────────────┐   TypeORM/SQL   ┌───────────┐
│  React + TypeScript│ ───────────────────────────► │ Node.js + TypeScript│ ──────────────► │   MySQL   │
│   localhost:5173   │ ◄─────────────────────────── │   Express :8080     │ ◄────────────── │   :3306   │
└────────────────────┘                              └─────────────────────┘                 └───────────┘
```

### Camadas do back-end

Cada requisição atravessa as camadas sempre na mesma ordem, e cada uma tem uma responsabilidade única:

```
requisição
    │
    ▼
[ middleware ]  autenticar → autorizar          quem é você? o que pode fazer?
    │
    ▼
[ controller ]  recebe a requisição HTTP        traduz HTTP ↔ objetos
    │
    ▼
[  service   ]  REGRAS DE NEGÓCIO               valida, decide, audita
    │
    ▼
[ repository ]  consultas ao banco              fala SQL (via TypeORM)
    │
    ▼
[  entity    ]  espelho das tabelas             mapeia classe ↔ tabela
```

| Pasta (`backend/src`) | Responsabilidade |
|---|---|
| `config/` | Conexão com o banco, CORS e conferência do `.env` |
| `entity/` | Classes que espelham as tabelas (decoradores TypeORM) |
| `repository/` | Consultas ao banco, inclusive as específicas do sistema |
| `service/` | Regras de negócio, validações e auditoria |
| `controller/` | Rotas REST |
| `middleware/` | Autenticação e autorização |
| `error/` | Tipos de erro e tratador global |
| `util/` | Hash/token (`seguranca.ts`) e conversores de tipos (`transformers.ts`) |
| `testes/` | Testes automatizados |

### Camadas do front-end

| Pasta (`frontend/src`) | Responsabilidade |
|---|---|
| `paginas/` | Uma tela por arquivo |
| `componentes/` | Layout, rota protegida e avisos reutilizáveis |
| `contexto/` | Estado global do usuário logado |
| `util/` | Formatação de datas e idade |
| `api.ts` | Único ponto que fala com o back-end |
| `tipos.ts` | Formato dos dados devolvidos pela API |

### Tecnologias

| Camada | Tecnologia | Versão |
|---|---|---|
| Front-end | React + TypeScript, React Router | 18.3 / 4.9 / 6.26 |
| Back-end | Node.js, Express, TypeScript | 22 / 4.19 / 5.5 |
| ORM | TypeORM | 0.3 |
| Banco | MySQL | 8.x |
| Segurança | bcryptjs, jsonwebtoken | 3.x / 9.x |
| Testes | `node:test` (nativo) + ts-node | — |

### Decisões técnicas e justificativas

- **JWT com lista de revogação.** Um token JWT continua válido até expirar, o que faria o logout ser apenas aparente. Guardamos o número de série (`jti`) dos tokens encerrados e o middleware os recusa. *(Limitação: a lista fica na memória do processo; em produção usaríamos Redis.)*
- **`select: false` na coluna da senha.** O hash não é trazido nas consultas comuns, então não vaza no JSON nem por descuido. Apenas o login o solicita explicitamente.
- **Regra de acesso isolada em `acesso.ts`.** A pergunta "quem pode ver este paciente?" tem uma única implementação, usada por todos os services — nenhuma tela pode esquecer de aplicá-la.
- **`synchronize: false` no TypeORM.** A estrutura do banco vem exclusivamente do `schema.sql`, e o ORM nunca a altera sozinho.
- **Erro 500 sem detalhe técnico.** Mensagens do MySQL revelariam nomes de tabelas e, num erro de conexão, até credenciais.

---

## 9. Instalação e execução

Ver **[Manual do Usuário](06-MANUAL-DO-USUARIO.md)** e o `README.md` na raiz do repositório.

Resumo:

```bash
# 1. Banco — executar banco-de-dados/schema.sql no MySQL Workbench
# 2. Back-end
cd backend && cp .env.example .env   # ajustar DB_USER, DB_PASSWORD e JWT_SECRET
npm install && npm run dev           # http://localhost:8080
# 3. Front-end
cd frontend && npm install && npm start   # http://localhost:5173
```

---

## 10. Descrição da inovação

### Agenda com confirmação de atendimento e indicadores

**O problema observado.** A confirmação de presença hoje acontece por mensagem de aplicativo: o profissional pergunta, o paciente responde (ou não), e essa informação se perde na conversa. No fim do mês, ninguém sabe quantas faltas houve, nem se confirmar antecipadamente reduz o problema.

**O que o PsiGestor faz.** Cada atendimento percorre um ciclo de vida explícito e registrado:

```
Agendado ──confirmar──► Confirmado ──► Realizado
    │                        │
    └──► Cancelado           └──► Falta
```

O sistema grava o momento exato da confirmação (`confirmado_em`) e impede transições sem sentido — não é possível confirmar um atendimento já cancelado nem reabrir um encerrado.

**O valor gerado.** Desse registro nascem dois indicadores no painel:

- **Taxa de confirmação** = (confirmados + realizados) ÷ total de atendimentos
- **Taxa de faltas** = faltas ÷ (realizados + faltas)

A taxa de faltas compara apenas com os atendimentos que **já aconteceram**; incluir os agendados para o futuro rebaixaria o número artificialmente. Acima de 20%, o indicador fica destacado em cor de alerta.

Cada psicólogo vê os próprios números; o administrador vê os da clínica inteira. O profissional passa a ter um dado objetivo para decidir, por exemplo, se vale a pena reforçar o lembrete de confirmação.

**Tabela da inovação:** `atendimentos` (item "entidade_inovacao" do modelo mínimo).

---

## 11. Conclusão, limitações e melhorias futuras

### Resultados alcançados

O produto entrega os fluxos completos de ponta a ponta: login com identificação de perfil, painel com indicadores, gestão de acessos, cadastro de psicólogos e clientes/pacientes, controle de vínculos, agenda com confirmação e trilha de auditoria — tudo persistido em MySQL e consumido pela interface React.

### Limitações conhecidas

1. **Revogação de token em memória.** A lista de tokens encerrados se perde ao reiniciar o servidor e não é compartilhada entre múltiplas instâncias.
2. **Sem recuperação de senha pelo usuário.** A redefinição depende do administrador; não há envio de e-mail.
3. **Sem paginação.** As listagens trazem todos os registros; com milhares de linhas seria necessário paginar.
4. **Filtros aplicados em memória** em algumas listagens, em vez de no `WHERE` do SQL.
5. **Testes automatizados cobrem segurança e validação**, não os fluxos que dependem do banco (esses foram verificados manualmente).
6. **Sem registro de segundo fator** de autenticação.

### Melhorias futuras

- Paginação e filtros no SQL.
- Recuperação de senha por e-mail com token temporário.
- Lembrete automático de confirmação (e-mail/WhatsApp) um dia antes do atendimento.
- Relatórios exportáveis (PDF/CSV) de atendimentos e faltas por período.
- Formulários configuráveis por área de atuação.
- Testes de integração com banco de dados de teste.

---

## 12. Referências

- MySQL 8.0 Reference Manual. Oracle. <https://dev.mysql.com/doc/refman/8.0/en/>
- TypeScript Handbook. Microsoft. <https://www.typescriptlang.org/docs/handbook/>
- Express.js — Guide. <https://expressjs.com/pt-br/guide/routing.html>
- TypeORM Documentation. <https://typeorm.io/>
- React Documentation. Meta. <https://react.dev/>
- React Router. <https://reactrouter.com/>
- OWASP. *Password Storage Cheat Sheet*. <https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html>
- OWASP. *Authorization Cheat Sheet*. <https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html>
- JSON Web Tokens — Introduction. <https://jwt.io/introduction>
- BRASIL. Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais).
- CONSELHO FEDERAL DE PSICOLOGIA. Resolução CFP nº 001/2009 (guarda de documentos) e Código de Ética Profissional do Psicólogo.
- MDN Web Docs — CSS Grid Layout e Media Queries. <https://developer.mozilla.org/>
