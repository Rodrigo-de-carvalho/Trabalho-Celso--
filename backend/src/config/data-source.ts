// ============================================================
//  data-source.ts — CONFIGURAÇÃO DA CONEXÃO COM O BANCO (MySQL local)
// ============================================================
// Este arquivo é o equivalente ao "application.properties": é aqui que dizemos
// onde está o banco, com qual usuário conectar e quais entidades existem.
//
// IMPORTANTE: ajuste o usuário e a senha no arquivo ".env" de acordo com o
// MySQL instalado no PC onde o projeto vai rodar (no laboratório/apresentação).
// Basta copiar o ".env.example" para ".env" e preencher.

import 'reflect-metadata' // obrigatório para os decoradores (@Entity, @Column...) funcionarem
import * as dotenv from 'dotenv'
import { DataSource } from 'typeorm'

import { Perfil } from '../entity/Perfil'
import { Usuario } from '../entity/Usuario'
import { Psicologo } from '../entity/Psicologo'
import { ClientePaciente } from '../entity/ClientePaciente'
import { Vinculo } from '../entity/Vinculo'
import { Atendimento } from '../entity/Atendimento'
import { LogAcao } from '../entity/LogAcao'

// Lê o arquivo .env e joga os valores em process.env.
// Se o arquivo não existir (ex: na máquina do professor), nada quebra: cada
// configuração abaixo tem um valor padrão depois do "??".
dotenv.config()

export const AppDataSource = new DataSource({
  // Qual banco estamos usando.
  type: 'mysql',

  // Endereço do banco: localhost (mesmo PC), porta 3306 (padrão do MySQL),
  // banco "psigestor" (o mesmo criado pelo schema.sql).
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),

  // Usuário do MySQL (uso o root mesmo, no meu PC).
  username: process.env.DB_USER ?? 'root',

  // Senha do banco. Não deixo fixa aqui pra não ficar salva no Git —
  // pego da variável de ambiente DB_PASSWORD (e se não tiver, assume vazia).
  password: process.env.DB_PASSWORD ?? '',

  database: process.env.DB_NAME ?? 'psigestor',

  // Lista das classes que representam as tabelas.
  entities: [Perfil, Usuario, Psicologo, ClientePaciente, Vinculo, Atendimento, LogAcao],

  // synchronize = false: o TypeORM NÃO mexe na estrutura do banco.
  // Quem cria as tabelas é o nosso schema.sql (rodado antes, no MySQL Workbench).
  // Deixar false é o mais seguro: garante que o banco entregue no trabalho é
  // exatamente o do schema.sql, e nada é apagado por engano.
  synchronize: false,

  // Mostra no console o SQL que o TypeORM executa (ótimo para a apresentação,
  // dá pra mostrar pro professor as queries acontecendo de verdade).
  logging: true,

  // Fuso horário usado na conversão das datas.
  timezone: 'local',
})
