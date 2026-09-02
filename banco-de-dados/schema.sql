-- Criar o banco de dados
CREATE DATABASE clinica_odontologica;
USE clinica_odontologica;

CREATE TABLE plano_odontologico (
    id_plano INT PRIMARY KEY AUTO_INCREMENT,
    nome_plano VARCHAR(100) NOT NULL,
    operadora VARCHAR(100),
    desconto_percentual DECIMAL(5,2) DEFAULT 0,
    cobertura TEXT
);

CREATE TABLE paciente (
    id_paciente INT PRIMARY KEY AUTO_INCREMENT,
    nome_completo VARCHAR(100) NOT NULL,
    data_nascimento DATE,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    rg VARCHAR(12) UNIQUE,
    sexo ENUM('Masculino', 'Feminino', 'Prefiro não dizer'),
    telefone VARCHAR(15) NOT NULL,
    email VARCHAR(100) UNIQUE,
    endereco VARCHAR(100),
    estado CHAR(2),
    cidade VARCHAR(50),
    cep VARCHAR(8),
    id_plano INT,
    numero_carteirinha VARCHAR(30),
    data_validade_plano DATE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_plano) REFERENCES plano_odontologico(id_plano)
);

CREATE TABLE dentista (
    id_dentista INT PRIMARY KEY AUTO_INCREMENT,
    nome_completo VARCHAR(100) NOT NULL,
    cro VARCHAR(20) NOT NULL UNIQUE,
    especialidade VARCHAR(100),
    telefone VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    data_contratacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE procedimento (
    id_procedimento INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    valor DECIMAL(10,2) NOT NULL,
    tempo_estimado INT
);

CREATE TABLE agendamento (
    id_agendamento INT PRIMARY KEY AUTO_INCREMENT,
    id_paciente INT NOT NULL,
    id_dentista INT NOT NULL,
    id_procedimento INT NOT NULL,
    data_hora DATETIME NOT NULL,
    status ENUM('Agendado', 'Cancelado', 'Remarcado', 'Paciente Faltou', 'Atendimento Concluído') DEFAULT 'Agendado',
    observacoes TEXT,
    data_agendamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente),
    FOREIGN KEY (id_dentista) REFERENCES dentista(id_dentista),
    FOREIGN KEY (id_procedimento) REFERENCES procedimento(id_procedimento)
);

CREATE TABLE consulta (
    id_consulta INT PRIMARY KEY AUTO_INCREMENT,
    id_agendamento INT NOT NULL,
    id_paciente INT NOT NULL,
    id_dentista INT NOT NULL,
    id_procedimento INT NOT NULL,
    data_hora_realizacao DATETIME NOT NULL,
    observacoes TEXT,
    valor_total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_agendamento) REFERENCES agendamento(id_agendamento),
    FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente),
    FOREIGN KEY (id_dentista) REFERENCES dentista(id_dentista),
    FOREIGN KEY (id_procedimento) REFERENCES procedimento(id_procedimento)
);

CREATE TABLE pagamento (
    id_pagamento INT PRIMARY KEY AUTO_INCREMENT,
    id_consulta INT NOT NULL,
    forma_pagamento ENUM('Dinheiro', 'Cartão Débito', 'Cartão Crédito', 'Pix', 'Boleto') NOT NULL,
    valor_pago DECIMAL(10,2) NOT NULL,
    data_pagamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parcelas INT DEFAULT 1,
    descricao VARCHAR(100) NULL,
    FOREIGN KEY (id_consulta) REFERENCES consulta(id_consulta) ON DELETE CASCADE
);

CREATE TABLE historico_clinico (
    id_historico INT PRIMARY KEY AUTO_INCREMENT,
    id_paciente INT NOT NULL,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    alergias TEXT,
    doencas_sistemicas TEXT,
    medicamentos_continuos TEXT,
    observacoes TEXT,
    FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente)
);

CREATE TABLE agenda (
    id_agenda INT PRIMARY KEY AUTO_INCREMENT,
    id_dentista INT NOT NULL,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    disponivel BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_dentista) REFERENCES dentista(id_dentista)
);
