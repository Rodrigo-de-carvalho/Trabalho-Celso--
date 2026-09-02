-- ============================================================================
--  PsiGestor — Plataforma de Gestão para Profissionais de Psicologia
--  Script de criação do banco de dados + dados fictícios de demonstração
-- ----------------------------------------------------------------------------
--  Como usar: abra este arquivo no MySQL Workbench e execute tudo de uma vez
--  (raio ⚡). Ao final, confirme com:  USE psigestor; SHOW TABLES;  (7 tabelas)
--
--  ATENÇÃO: todos os dados abaixo são FICTÍCIOS, criados apenas para a
--  demonstração acadêmica. Nenhum dado real de paciente é utilizado.
-- ============================================================================

-- Apaga o banco se ele já existir, para o script poder ser rodado quantas
-- vezes forem necessárias sempre com o mesmo resultado.
DROP DATABASE IF EXISTS psigestor;
CREATE DATABASE psigestor
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;
USE psigestor;

-- ============================================================================
--  1. PERFIS DE ACESSO
--  Define O QUE cada tipo de usuário pode fazer no sistema.
-- ============================================================================
CREATE TABLE perfis (
    id_perfil INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(30) NOT NULL UNIQUE,
    descricao VARCHAR(255) NOT NULL
);

-- ============================================================================
--  2. USUÁRIOS
--  Quem consegue entrar na plataforma. A senha NUNCA é guardada em texto puro:
--  a coluna senha_hash guarda o resultado do hash bcrypt (60 caracteres).
-- ============================================================================
CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nome_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    id_perfil INT NOT NULL,
    -- Situação controla o acesso: só quem está "Ativo" consegue fazer login.
    situacao ENUM('Ativo', 'Inativo', 'Bloqueado') NOT NULL DEFAULT 'Ativo',
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso DATETIME NULL,
    CONSTRAINT fk_usuario_perfil FOREIGN KEY (id_perfil) REFERENCES perfis(id_perfil)
);

-- ============================================================================
--  3. PSICÓLOGOS
--  Dados profissionais de quem atende. Cada psicólogo é UM usuário do sistema
--  (relação 1 para 1, garantida pelo UNIQUE em id_usuario).
-- ============================================================================
CREATE TABLE psicologos (
    id_psicologo INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL UNIQUE,
    -- CRP = registro no Conselho Regional de Psicologia (único por profissional).
    crp VARCHAR(20) NOT NULL UNIQUE,
    area_atuacao ENUM(
        'Clínica', 'Organizacional e do Trabalho', 'Escolar e Educacional',
        'Hospitalar', 'Social', 'Jurídica', 'Do Esporte', 'Do Trânsito',
        'Neuropsicologia', 'Pesquisa e Docência'
    ) NOT NULL,
    abordagem VARCHAR(100) NULL,
    telefone VARCHAR(15) NULL,
    CONSTRAINT fk_psicologo_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- ============================================================================
--  4. CLIENTES / PACIENTES
--  Dados ADMINISTRATIVOS das pessoas atendidas. Repare que aqui não guardamos
--  conteúdo clínico/sigiloso de sessão — apenas o necessário para a gestão.
-- ============================================================================
CREATE TABLE clientes_pacientes (
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    nome_completo VARCHAR(100) NOT NULL,
    data_nascimento DATE NULL,
    email VARCHAR(100) NULL,
    telefone VARCHAR(15) NOT NULL,
    cidade VARCHAR(50) NULL,
    estado CHAR(2) NULL,
    -- Preferimos INATIVAR a apagar, para não perder o histórico (regra do edital).
    situacao ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo',
    observacoes_administrativas TEXT NULL,
    -- Quem cadastrou (rastreabilidade).
    id_usuario_cadastro INT NULL,
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cliente_usuario_cadastro
        FOREIGN KEY (id_usuario_cadastro) REFERENCES usuarios(id_usuario)
);

-- ============================================================================
--  5. VÍNCULOS
--  Liga um psicólogo a um cliente/paciente. É esta tabela que decide QUAIS
--  pacientes um psicólogo enxerga no sistema.
-- ============================================================================
CREATE TABLE vinculos (
    id_vinculo INT PRIMARY KEY AUTO_INCREMENT,
    id_psicologo INT NOT NULL,
    id_cliente INT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_vinculo_psicologo FOREIGN KEY (id_psicologo) REFERENCES psicologos(id_psicologo),
    CONSTRAINT fk_vinculo_cliente FOREIGN KEY (id_cliente) REFERENCES clientes_pacientes(id_cliente),
    -- Impede cadastrar o mesmo par psicólogo+paciente duas vezes.
    CONSTRAINT uq_vinculo UNIQUE (id_psicologo, id_cliente)
);

-- ============================================================================
--  6. ATENDIMENTOS  (tabela da FUNCIONALIDADE INOVADORA)
--  Agenda de atendimentos com CONFIRMAÇÃO: o atendimento nasce "Agendado",
--  passa a "Confirmado" quando o paciente confirma presença e termina como
--  "Realizado", "Cancelado" ou "Falta". É daqui que saem os indicadores
--  (taxa de confirmação, taxa de faltas) mostrados nos painéis.
-- ============================================================================
CREATE TABLE atendimentos (
    id_atendimento INT PRIMARY KEY AUTO_INCREMENT,
    id_psicologo INT NOT NULL,
    id_cliente INT NOT NULL,
    data_hora DATETIME NOT NULL,
    duracao_minutos INT NOT NULL DEFAULT 50,
    modalidade ENUM('Presencial', 'Online') NOT NULL DEFAULT 'Presencial',
    status ENUM('Agendado', 'Confirmado', 'Realizado', 'Cancelado', 'Falta')
        NOT NULL DEFAULT 'Agendado',
    -- Momento em que o atendimento foi confirmado (fica nulo até a confirmação).
    confirmado_em DATETIME NULL,
    observacoes TEXT NULL,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_atendimento_psicologo FOREIGN KEY (id_psicologo) REFERENCES psicologos(id_psicologo),
    CONSTRAINT fk_atendimento_cliente FOREIGN KEY (id_cliente) REFERENCES clientes_pacientes(id_cliente),
    -- Um psicólogo não pode ter dois atendimentos no mesmo horário.
    CONSTRAINT uq_agenda_psicologo UNIQUE (id_psicologo, data_hora)
);

-- ============================================================================
--  7. LOGS DE AÇÕES (auditoria)
--  Registra QUEM fez O QUÊ e QUANDO. Só é lido pelo administrador e o sistema
--  nunca apaga estes registros.
-- ============================================================================
CREATE TABLE logs_acoes (
    id_log INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NULL,
    acao VARCHAR(60) NOT NULL,
    entidade VARCHAR(40) NOT NULL,
    id_entidade INT NULL,
    detalhes VARCHAR(255) NULL,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Índices que aceleram as consultas mais usadas do sistema.
CREATE INDEX idx_usuarios_situacao ON usuarios (situacao);
CREATE INDEX idx_clientes_nome ON clientes_pacientes (nome_completo);
CREATE INDEX idx_atendimentos_data ON atendimentos (data_hora);
CREATE INDEX idx_logs_data ON logs_acoes (data_hora);

-- ============================================================================
--                    DADOS FICTÍCIOS PARA DEMONSTRAÇÃO
-- ============================================================================

-- ---- Perfis de acesso ----
INSERT INTO perfis (id_perfil, nome, descricao) VALUES
(1, 'Administrador', 'Gerencia usuários, perfis, permissões e todos os cadastros do sistema.'),
(2, 'Psicologo', 'Acessa o próprio painel e apenas os clientes/pacientes vinculados a ele.'),
(3, 'Atendente', 'Realiza cadastros e consultas administrativas, sem acesso à agenda clínica.');

-- ---- Usuários ----
-- As senhas abaixo estão protegidas com hash bcrypt. As senhas em texto puro
-- (apenas para a demonstração em sala) são:
--     admin@psigestor.com    -> admin123
--     (todos os psicólogos)  -> psi123
--     recepcao@psigestor.com -> atend123
INSERT INTO usuarios (id_usuario, nome_completo, email, senha_hash, id_perfil, situacao) VALUES
(1, 'Marina Alves Ribeiro',   'admin@psigestor.com',    '$2b$10$tWSHNc2wvXFZLlN.a9ef3uNqxlSWJwDQEoXReY.f.VX7yUD9lnRW.', 1, 'Ativo'),
(2, 'Bruno Carvalho Menezes', 'bruno@psigestor.com',    '$2b$10$ABQWywZy/QQBZvqxDL0Bfeimjm9b9Xz54VX0pj4nAeTAt.ZX5Rruq', 2, 'Ativo'),
(3, 'Carla Souza Andrade',    'carla@psigestor.com',    '$2b$10$ABQWywZy/QQBZvqxDL0Bfeimjm9b9Xz54VX0pj4nAeTAt.ZX5Rruq', 2, 'Ativo'),
(4, 'Diego Nunes Pereira',    'diego@psigestor.com',    '$2b$10$ABQWywZy/QQBZvqxDL0Bfeimjm9b9Xz54VX0pj4nAeTAt.ZX5Rruq', 2, 'Inativo'),
(5, 'Elaine Martins Rocha',   'recepcao@psigestor.com', '$2b$10$LEBJk4DEUodz05VqYR6btuHmdcI7/grZULSwd8cqAow2DRXs8QLpu', 3, 'Ativo'),
(6, 'Fábio Teixeira Lima',    'fabio@psigestor.com',    '$2b$10$ABQWywZy/QQBZvqxDL0Bfeimjm9b9Xz54VX0pj4nAeTAt.ZX5Rruq', 2, 'Bloqueado');

-- ---- Psicólogos ----
INSERT INTO psicologos (id_psicologo, id_usuario, crp, area_atuacao, abordagem, telefone) VALUES
(1, 2, 'CRP 03/11111', 'Clínica',                      'Terapia Cognitivo-Comportamental', '71988880001'),
(2, 3, 'CRP 03/22222', 'Escolar e Educacional',        'Psicologia Histórico-Cultural',    '71988880002'),
(3, 4, 'CRP 03/33333', 'Organizacional e do Trabalho', 'Análise do Comportamento',         '71988880003'),
(4, 6, 'CRP 03/44444', 'Neuropsicologia',              'Avaliação Neuropsicológica',       '71988880004');

-- ---- Clientes / pacientes ----
INSERT INTO clientes_pacientes
(id_cliente, nome_completo, data_nascimento, email, telefone, cidade, estado, situacao, observacoes_administrativas, id_usuario_cadastro) VALUES
(1, 'Ana Beatriz Fontes',   '1995-04-12', 'ana.fontes@exemplo.com',   '71997770001', 'Salvador',     'BA', 'Ativo',   'Prefere atendimento no turno da manhã.', 1),
(2, 'Caio Moreira Dias',    '2001-09-30', 'caio.dias@exemplo.com',    '71997770002', 'Lauro de Freitas', 'BA', 'Ativo', 'Encaminhado pela escola.', 5),
(3, 'Helena Prado Nobre',   '1988-01-25', 'helena.nobre@exemplo.com', '71997770003', 'Salvador',     'BA', 'Ativo',   NULL, 1),
(4, 'Igor Santana Melo',    '1979-11-08', 'igor.melo@exemplo.com',    '71997770004', 'Camaçari',     'BA', 'Ativo',   'Atendimento online.', 5),
(5, 'Júlia Freitas Campos', '2010-06-17', 'julia.campos@exemplo.com', '71997770005', 'Salvador',     'BA', 'Ativo',   'Responsável legal: Marcos Campos.', 5),
(6, 'Lucas Vieira Rangel',  '1993-02-03', 'lucas.rangel@exemplo.com', '71997770006', 'Salvador',     'BA', 'Inativo', 'Encerrou o acompanhamento em 2025.', 1);

-- ---- Vínculos (quem atende quem) ----
INSERT INTO vinculos (id_vinculo, id_psicologo, id_cliente, data_inicio, data_fim, ativo) VALUES
(1, 1, 1, '2026-01-15', NULL, TRUE),
(2, 1, 3, '2026-02-02', NULL, TRUE),
(3, 1, 6, '2025-03-10', '2025-12-18', FALSE),
(4, 2, 2, '2026-02-20', NULL, TRUE),
(5, 2, 5, '2026-03-01', NULL, TRUE),
(6, 3, 4, '2026-01-08', NULL, TRUE);

-- ---- Atendimentos (funcionalidade inovadora: agenda com confirmação) ----
INSERT INTO atendimentos
(id_atendimento, id_psicologo, id_cliente, data_hora, duracao_minutos, modalidade, status, confirmado_em, observacoes) VALUES
(1, 1, 1, '2026-09-08 09:00:00', 50, 'Presencial', 'Confirmado', '2026-09-05 14:20:00', 'Sessão de acompanhamento.'),
(2, 1, 3, '2026-09-08 10:00:00', 50, 'Online',     'Agendado',   NULL, NULL),
(3, 1, 1, '2026-09-01 09:00:00', 50, 'Presencial', 'Realizado',  '2026-08-29 10:05:00', NULL),
(4, 1, 3, '2026-08-25 10:00:00', 50, 'Presencial', 'Falta',      NULL, 'Paciente não compareceu e não avisou.'),
(5, 2, 2, '2026-09-09 14:00:00', 50, 'Presencial', 'Confirmado', '2026-09-04 09:40:00', 'Devolutiva com a escola.'),
(6, 2, 5, '2026-09-10 15:00:00', 50, 'Presencial', 'Agendado',   NULL, NULL),
(7, 2, 5, '2026-08-27 15:00:00', 50, 'Presencial', 'Cancelado',  NULL, 'Cancelado pelo responsável.'),
(8, 3, 4, '2026-09-11 08:00:00', 60, 'Online',     'Agendado',   NULL, 'Avaliação de clima organizacional.');

-- ---- Logs de ações (auditoria inicial) ----
INSERT INTO logs_acoes (id_usuario, acao, entidade, id_entidade, detalhes) VALUES
(1, 'CRIAR',            'usuarios',           2, 'Cadastro do usuário Bruno Carvalho Menezes.'),
(1, 'CRIAR',            'psicologos',         1, 'Cadastro do psicólogo CRP 03/11111.'),
(1, 'ALTERAR_SITUACAO', 'usuarios',           4, 'Situação alterada para Inativo.'),
(1, 'BLOQUEAR',         'usuarios',           6, 'Usuário bloqueado por solicitação da coordenação.'),
(5, 'CRIAR',            'clientes_pacientes', 2, 'Cadastro do cliente Caio Moreira Dias.'),
(2, 'CONFIRMAR',        'atendimentos',       1, 'Atendimento confirmado pelo paciente.');
