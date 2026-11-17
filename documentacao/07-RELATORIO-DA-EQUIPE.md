# Relatório da Equipe de Desenvolvimento — PsiGestor

**Centro Universitário Jorge Amado — UC Desenvolvimento Dinâmico**
**AV3 — Projeto Integrador: Desenvolvimento de Sistemas com TypeScript e MySQL**
**Professor:** Msc. Celso Barreto

| | |
|---|---|
| **Produto** | PsiGestor — Plataforma de Gestão para Profissionais de Psicologia |
| **Turma** | Análise e Desenvolvimento de Sistemas (ADS) |
| **Data** | 16/10/2026 |
| **Repositório** | https://github.com/Rodrigo-de-carvalho/Trabalho-Celso-- |

> Documento exigido pelo item 16 do edital da AV3: relatório contendo a função
> de cada integrante na equipe de desenvolvimento e sua atuação ao longo do
> projeto.

---

## 1. Composição da equipe

| Integrante | Função na equipe |
|---|---|
| Gabriel Oliveira dos Santos | Back-end — Segurança e controle de acesso |
| Giovana Amaral dos Santos | Front-end — Interface e integração com a API |
| Pedro Gustavo Pereira Barbosa da Cruz | Banco de dados — Modelagem e persistência |
| Rodrigo de Carvalho Costa | Liderança técnica — Arquitetura, integração e versionamento |
| Victor Costa da Cruz | Inovação e documentação |

A equipe trabalhou com divisão por camada, de modo que cada integrante
respondesse por uma parte identificável do produto, mas com revisão cruzada:
nenhuma entrega foi incorporada sem leitura de pelo menos um outro membro.

---

## 2. Atuação individual

### Gabriel Oliveira dos Santos — Back-end: segurança e controle de acesso

**Responsabilidade.** Garantir que o sistema cumpra as regras de negócio
essenciais do item 10 do edital: ninguém acessa páginas internas sem estar
autenticado, somente o administrador altera perfis e situações, e nenhum
usuário consegue elevar a própria permissão.

**Atuação.**

- Implementou a autenticação por token JWT e o armazenamento de senhas com
  hash bcrypt, de forma que a senha em texto puro não exista em nenhum ponto
  do sistema.
- Construiu os middlewares `autenticar` e `autorizar`, que protegem as rotas
  antes de qualquer consulta ao banco.
- Escreveu a regra de escopo de acesso do psicólogo, que limita o que cada
  profissional enxerga aos clientes/pacientes vinculados a ele.
- Implementou a trava que impede um usuário de alterar o próprio perfil ou a
  própria situação.
- Cobriu essas regras com testes automatizados.

**Principais artefatos.** `backend/src/util/seguranca.ts`,
`backend/src/middleware/autenticacao.ts`, `backend/src/service/AuthService.ts`,
`backend/src/service/UsuarioService.ts`, `backend/src/service/acesso.ts`,
`backend/src/testes/seguranca.test.ts`, `backend/src/testes/acesso.test.ts`

---

### Giovana Amaral dos Santos — Front-end: interface e integração com a API

**Responsabilidade.** Entregar uma aplicação web responsiva que consuma a API
real, com validação de entrada e estados de interação claros, conforme o item
7 do edital.

**Atuação.**

- Desenvolveu as oito telas do sistema: Login, Painel, Usuários, Psicólogos,
  Clientes/Pacientes, Agenda, Meu Perfil e Auditoria.
- Implementou o cliente da API em TypeScript, responsável por anexar o token
  de autenticação a cada requisição e por tratar a expiração de sessão.
- Construiu o contexto de autenticação e as rotas protegidas, que escondem do
  usuário as áreas às quais seu perfil não tem acesso.
- Cuidou da responsividade e da identidade visual, derivando a paleta do
  logotipo do produto.
- Tratou os estados de carregamento, erro e lista vazia em todas as telas.

**Principais artefatos.** `frontend/src/paginas/`, `frontend/src/api.ts`,
`frontend/src/contexto/Autenticacao.tsx`, `frontend/src/componentes/`,
`frontend/src/index.css`

---

### Pedro Gustavo Pereira Barbosa da Cruz — Banco de dados: modelagem e persistência

**Responsabilidade.** Modelar e implementar o banco MySQL com os
relacionamentos, restrições e dados fictícios exigidos pelos itens 7 e 8 do
edital.

**Atuação.**

- Modelou as sete tabelas do sistema e definiu as oito chaves estrangeiras que
  amarram os relacionamentos.
- Escreveu o `schema.sql`, que cria o banco, as tabelas, os índices e o
  conjunto de dados fictícios usado na demonstração.
- Definiu as restrições de integridade, entre elas a que impede dois
  atendimentos no mesmo horário para o mesmo psicólogo e a que impede vínculo
  duplicado entre psicólogo e cliente.
- Mapeou as entidades no TypeORM e implementou a camada de acesso a dados.
- Produziu o diagrama entidade-relacionamento e o dicionário de dados.

**Principais artefatos.** `banco-de-dados/schema.sql`,
`backend/src/entity/`, `backend/src/repository/repositories.ts`,
`backend/src/config/data-source.ts`, `documentacao/02-DIAGRAMA-ER.md`,
`documentacao/03-DICIONARIO-DE-DADOS.md`

---

### Rodrigo de Carvalho Costa — Liderança técnica: arquitetura, integração e versionamento

**Responsabilidade.** Definir a arquitetura da solução, manter o repositório
organizado e garantir que front-end, back-end e banco funcionassem como um
produto único, de ponta a ponta.

**Atuação.**

- Definiu a arquitetura em camadas do back-end — controladores, serviços e
  acesso a dados — e a estrutura de pastas do repositório.
- Configurou o projeto em TypeScript, o TypeORM e o uso de variáveis de
  ambiente para manter credenciais fora do controle de versão.
- Implementou o tratamento global de erros, que padroniza as respostas da API
  sem expor detalhes internos.
- Respondeu pela integração entre as três camadas, incluindo a configuração de
  CORS que permite ao front-end consumir a API.
- Manteve o versionamento no Git e redigiu o README com as instruções de
  instalação e execução.
- Conduziu os testes de ponta a ponta de cada fluxo principal.

**Principais artefatos.** `backend/src/app.ts`, `backend/src/index.ts`,
`backend/src/config/`, `backend/src/error/`, `backend/src/controller/`,
`README.md`

---

### Victor Costa da Cruz — Inovação e documentação

**Responsabilidade.** Implementar a funcionalidade inovadora exigida pelo item
6.5 do edital e reunir a documentação do projeto.

**Atuação.**

- Implementou a agenda com confirmação de atendimento, funcionalidade
  inovadora do grupo: cada atendimento percorre um ciclo de vida
  (Agendado, Confirmado, Realizado, Cancelado, Falta) e o sistema registra o
  instante exato da confirmação.
- Desenvolveu os indicadores derivados desse ciclo — taxa de confirmação e
  taxa de faltas — com o cuidado de calcular a taxa de faltas apenas sobre os
  atendimentos que já ocorreram, para não distorcer o número.
- Implementou o registro de auditoria, que grava autor, ação, entidade e
  data/hora de cada operação relevante.
- Redigiu a documentação do projeto e o manual do usuário.
- Organizou as evidências de teste e o roteiro do vídeo-pitch.

**Principais artefatos.** `backend/src/service/AtendimentoService.ts`,
`backend/src/service/PainelService.ts`, `backend/src/service/LogService.ts`,
`backend/src/entity/Atendimento.ts`, `documentacao/01-DOCUMENTACAO.md`,
`documentacao/06-MANUAL-DO-USUARIO.md`

---

## 3. Participação por etapa do projeto

As etapas seguem a organização sugerida no item 17 do edital.

| Etapa | Gabriel | Giovana | Pedro | Rodrigo | Victor |
|---|:---:|:---:|:---:|:---:|:---:|
| 1. Compreender o problema e definir a inovação | ● | ● | ● | ● | ● |
| 2. Modelar telas, API e banco | ○ | ● | ● | ● | ○ |
| 3. Criar o MySQL e o back-end TypeScript | ● | — | ● | ● | ● |
| 4. Desenvolver o front-end | — | ● | — | ○ | ○ |
| 5. Integrar e testar | ● | ● | ○ | ● | ● |
| 6. Documentar e gravar o pitch | ○ | ○ | ● | ● | ● |

● responsável · ○ participação de apoio · — sem atuação nesta etapa

---

## 4. Vídeo-pitch

O edital exige a participação de pelo menos dois integrantes com voz
identificável, apresentando partes diferentes do trabalho.

| Trecho | Responsável |
|---|---|
| Abertura, problema e solução | Rodrigo de Carvalho Costa |
| Demonstração do sistema (login, painel, gestão de acessos, cadastro) | Giovana Amaral dos Santos |
| Tecnologia: TypeScript, API, MySQL e integração | Gabriel Oliveira dos Santos |
| Inovação: agenda com confirmação e indicadores | Victor Costa da Cruz |
| Encerramento: resultados, limitações e próximos passos | Pedro Gustavo Pereira Barbosa da Cruz |

---

## 5. Declaração

Os integrantes listados neste documento participaram do desenvolvimento do
PsiGestor nas funções descritas acima. O histórico de commits do repositório
registra as contribuições individuais.

| Integrante | Função |
|---|---|
| Gabriel Oliveira dos Santos | Back-end — Segurança e controle de acesso |
| Giovana Amaral dos Santos | Front-end — Interface e integração com a API |
| Pedro Gustavo Pereira Barbosa da Cruz | Banco de dados — Modelagem e persistência |
| Rodrigo de Carvalho Costa | Liderança técnica — Arquitetura, integração e versionamento |
| Victor Costa da Cruz | Inovação e documentação |

Salvador, 16 de outubro de 2026.
