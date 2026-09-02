# Manual do Usuário — PsiGestor

## Parte I — Instalação

### Pré-requisitos

| Programa | Versão | Onde obter |
|---|---|---|
| Node.js | 18 ou superior | <https://nodejs.org> |
| MySQL Server + Workbench | 8.0 | <https://dev.mysql.com/downloads/> |

Confira a instalação com:

```bash
node --version
npm --version
```

### Passo 1 — Criar o banco de dados

1. Abra o **MySQL Workbench** e conecte-se ao servidor local.
2. Abra o arquivo `banco-de-dados/schema.sql`.
3. Execute o script inteiro (ícone do raio ⚡).
4. Confirme:

```sql
USE psigestor;
SHOW TABLES;          -- devem aparecer 7 tabelas
SELECT * FROM usuarios;  -- 6 usuários fictícios
```

> O script apaga e recria o banco a cada execução, então pode ser rodado quantas vezes for preciso.

### Passo 2 — Configurar e iniciar o back-end

```bash
cd backend
cp .env.example .env      # no Windows: copy .env.example .env
```

Abra o arquivo `.env` e ajuste:

```ini
DB_USER=root
DB_PASSWORD=sua_senha_do_mysql
JWT_SECRET=qualquer-texto-longo-e-aleatorio
```

Depois:

```bash
npm install
npm run dev
```

Deve aparecer:

```
✅ Conectado ao banco de dados MySQL (psigestor).
🧠 API do PsiGestor rodando em http://localhost:8080/api
```

### Passo 3 — Iniciar o front-end

Em **outro terminal**:

```bash
cd frontend
npm install
npm start
```

O navegador abre em `http://localhost:5173`.

### Se algo der errado

| Mensagem | Causa provável | Solução |
|---|---|---|
| `Configuração incompleta… JWT_SECRET` | O arquivo `.env` não existe ou está sem o segredo | Refaça o Passo 2 |
| `ER_ACCESS_DENIED_ERROR` | Usuário ou senha do MySQL incorretos | Corrija `DB_USER` / `DB_PASSWORD` no `.env` |
| `ER_BAD_DB_ERROR: Unknown database 'psigestor'` | O `schema.sql` não foi executado | Refaça o Passo 1 |
| `ECONNREFUSED ...:3306` | O MySQL não está rodando | Inicie o serviço do MySQL |
| Tela carrega mas nada aparece | O back-end não está rodando | Confira o terminal do Passo 2 |
| `Erro ao comunicar com o servidor` | Porta do front diferente de 5173 (CORS) | Confira `PORT=5173` em `frontend/.env` |

---

## Parte II — Usando o sistema

### Acessos de demonstração

| E-mail | Senha | Perfil |
|---|---|---|
| `admin@psigestor.com` | `admin123` | Administrador |
| `bruno@psigestor.com` | `psi123` | Psicólogo (Clínica) |
| `carla@psigestor.com` | `psi123` | Psicólogo (Escolar) |
| `recepcao@psigestor.com` | `atend123` | Atendente |

> Todos os dados são **fictícios**, criados apenas para a demonstração acadêmica.

---

### 1. Entrar no sistema

Informe e-mail e senha na tela inicial. O sistema identifica o seu perfil e monta o menu de acordo com ele: o administrador vê os itens de gestão; o psicólogo vê a área dele.

Se o seu acesso estiver **inativo** ou **bloqueado**, o sistema avisa e orienta a procurar o administrador.

---

### 2. Painel (todos os perfis)

É a tela inicial. Mostra:

- **Administrador:** total de usuários por situação, total de psicólogos e de clientes/pacientes.
- **Psicólogo:** total dos seus pacientes.
- **Ambos:** os indicadores da agenda (taxa de confirmação e taxa de faltas) e os próximos atendimentos.

---

### 3. Usuários *(somente Administrador)*

**Cadastrar:** preencha nome, e-mail, senha provisória e perfil → *Cadastrar usuário*.

**Controlar o acesso:** na lista, use os botões da coluna Ações:

| Botão | O que faz |
|---|---|
| **Liberar** | Deixa o usuário `Ativo` — passa a conseguir entrar |
| **Inativar** | Suspende o acesso (ex: profissional afastado) |
| **Bloquear** | Impede o acesso (ex: uso indevido) |
| **Redefinir senha** | Define uma nova senha para o usuário |

**Trocar o perfil:** use o menu suspenso na coluna Perfil.

> ⚠️ Os botões aparecem **desabilitados na sua própria linha** (marcada com a etiqueta "você"). Ninguém pode alterar o próprio perfil ou a própria situação — é o que impede que um usuário aumente as suas permissões.
>
> 🔒 Não existe nenhuma tela que mostre a senha de alguém. O sistema guarda apenas o *hash* — só é possível **redefinir**, nunca consultar.

---

### 4. Psicólogos *(somente Administrador)*

**O cadastro é feito em duas etapas:**

1. Em **Usuários**, crie o usuário com o perfil `Psicologo`.
2. Em **Psicólogos**, selecione esse usuário e informe CRP, área de atuação, abordagem e telefone.

**Gerenciar vínculos** — clique em *Gerenciar vínculos* na linha do profissional:

- Para **vincular**, escolha o cliente/paciente e clique em *Vincular*.
- Para **encerrar**, clique em *Encerrar* na linha do vínculo.

> O vínculo é o que define o que o psicólogo enxerga. Sem vínculo ativo, o paciente **não aparece** para ele. Encerrar um vínculo não apaga nada: o registro fica no histórico com a data de encerramento.

---

### 5. Clientes/Pacientes *(todos os perfis)*

**Importante:** o administrador e o atendente veem todos os registros; o **psicólogo vê apenas os pacientes vinculados a ele**.

- **Cadastrar:** preencha o formulário (nome e telefone são obrigatórios) → *Cadastrar*.
- **Editar:** clique em *Editar* — os dados sobem para o formulário no topo.
- **Buscar:** digite parte do nome no campo de busca.
- **Filtrar:** use o seletor de situação (Ativo/Inativo).
- **Inativar/Reativar:** clique no botão correspondente.

> Não existe botão de **excluir**. Quando alguém encerra o acompanhamento, o certo é **inativar**: assim o histórico de atendimentos é preservado.
>
> O sistema guarda apenas dados **administrativos**. Conteúdo de sessão não deve ser registrado aqui.

---

### 6. Agenda — com confirmação de atendimento ⭐

Esta é a funcionalidade que diferencia o PsiGestor.

**Agendar:** escolha o paciente, a data/hora, a duração e a modalidade → *Agendar atendimento*. O psicólogo agenda sempre na própria agenda; o administrador e o atendente escolhem para qual profissional.

**Acompanhar o atendimento:**

| Status | Significado | Próxima ação disponível |
|---|---|---|
| **Agendado** | Marcado, aguardando confirmação | *Confirmar presença* ou *Cancelar* |
| **Confirmado** | O paciente confirmou | *Marcar realizado*, *Registrar falta* ou *Cancelar* |
| **Realizado** | Aconteceu | — encerrado |
| **Cancelado** | Desmarcado | — encerrado |
| **Falta** | O paciente não compareceu | — encerrado |

Ao confirmar, o sistema grava o **momento exato** da confirmação. É desse registro que saem as duas taxas do Painel:

- **Taxa de confirmação** — quantos atendimentos chegaram a ser confirmados.
- **Taxa de faltas** — quantas faltas houve entre os atendimentos que já aconteceram. Acima de 20%, o indicador aparece destacado em laranja.

**Regras da agenda:**
- Não é possível marcar dois atendimentos no mesmo horário para o mesmo psicólogo.
- Só é possível agendar para pacientes **ativos** e **vinculados** ao profissional.
- Um atendimento encerrado (realizado, cancelado ou com falta) não pode ser reaberto.

---

### 7. Meu perfil *(somente Psicólogo)*

Consulte e atualize a sua área de atuação, abordagem e telefone.

O **CRP** e o **e-mail de acesso** aparecem apenas para leitura: alterá-los é uma correção de cadastro e depende do administrador.

---

### 8. Auditoria *(somente Administrador)*

Mostra **quem** fez **o quê** e **quando**: logins (inclusive os recusados), cadastros, alterações de situação e de perfil, redefinições de senha, vínculos criados/encerrados e confirmações de atendimento.

Use o campo de filtro para procurar por ação, usuário, tabela ou detalhe.

> Esta tela é **somente leitura**. Registros de auditoria nunca são apagados — nem pelo administrador, nem pela API.

---

### 9. Sair do sistema

Clique em **Sair**, no canto superior direito. O sistema invalida o token no servidor: mesmo que alguém tivesse uma cópia dele, não conseguiria mais usá-lo.
