// ============================================================
//  repositories.ts — A camada que CONVERSA COM O BANCO
// ============================================================
// Um "repository" do TypeORM já vem pronto com os métodos básicos:
// find (listar), findOneBy (buscar), save (salvar), delete (apagar), etc.
//
// Quando precisamos de uma consulta específica do nosso sistema (ex: "existe
// outro paciente com este CPF?"), usamos o .extend({...}) para adicionar
// métodos próprios, deixando as consultas longe dos services.

import { Like, Not } from 'typeorm'
import { AppDataSource } from '../config/data-source'

import { Agenda } from '../entity/Agenda'
import { Agendamento } from '../entity/Agendamento'
import { Consulta } from '../entity/Consulta'
import { Dentista } from '../entity/Dentista'
import { HistoricoClinico } from '../entity/HistoricoClinico'
import { Paciente } from '../entity/Paciente'
import { Pagamento } from '../entity/Pagamento'
import { PlanoOdontologico } from '../entity/PlanoOdontologico'
import { Procedimento } from '../entity/Procedimento'

// ----- PLANOS ODONTOLÓGICOS ----- (só o CRUD padrão, sem consulta extra)
export const planoRepository = AppDataSource.getRepository(PlanoOdontologico)

// ----- PROCEDIMENTOS -----
export const procedimentoRepository = AppDataSource.getRepository(Procedimento)

// ----- CONSULTAS -----
export const consultaRepository = AppDataSource.getRepository(Consulta)

// ----- PAGAMENTOS -----
export const pagamentoRepository = AppDataSource.getRepository(Pagamento)

// ----- PACIENTES -----
export const pacienteRepository = AppDataSource.getRepository(Paciente).extend({
  // "existe algum paciente com este CPF?" (usado ao CRIAR).
  existePorCpf(cpf: string) {
    return this.existsBy({ cpf })
  },
  // "existe OUTRO paciente com este CPF?" (usado ao EDITAR: ignora ele mesmo).
  existePorCpfComOutroId(cpf: string, idPaciente: number) {
    return this.existsBy({ cpf, idPaciente: Not(idPaciente) })
  },
  existePorEmail(email: string) {
    return this.existsBy({ email })
  },
  existePorEmailComOutroId(email: string, idPaciente: number) {
    return this.existsBy({ email, idPaciente: Not(idPaciente) })
  },
  existePorRg(rg: string) {
    return this.existsBy({ rg })
  },
  existePorRgComOutroId(rg: string, idPaciente: number) {
    return this.existsBy({ rg, idPaciente: Not(idPaciente) })
  },
  // Busca por nome OU CPF. O Like com % dos dois lados procura o termo em
  // qualquer parte do texto (equivalente ao "contém").
  buscarPorNomeOuCpf(termo: string) {
    return this.find({
      where: [{ nomeCompleto: Like(`%${termo}%`) }, { cpf: Like(`%${termo}%`) }],
    })
  },
})

// ----- DENTISTAS -----
export const dentistaRepository = AppDataSource.getRepository(Dentista).extend({
  existePorCro(cro: string) {
    return this.existsBy({ cro })
  },
  existePorCroComOutroId(cro: string, idDentista: number) {
    return this.existsBy({ cro, idDentista: Not(idDentista) })
  },
  existePorEmail(email: string) {
    return this.existsBy({ email })
  },
  existePorEmailComOutroId(email: string, idDentista: number) {
    return this.existsBy({ email, idDentista: Not(idDentista) })
  },
})

// ----- AGENDAMENTOS -----
export const agendamentoRepository = AppDataSource.getRepository(Agendamento).extend({
  // "este dentista já tem agendamento nesta data/hora?"
  existePorDentistaEDataHora(idDentista: number, dataHora: string) {
    return this.existsBy({ dentista: { idDentista }, dataHora })
  },
  // A mesma pergunta, mas ignorando um agendamento específico (usado na edição).
  existePorDentistaEDataHoraComOutroId(
    idDentista: number,
    dataHora: string,
    idAgendamento: number
  ) {
    return this.existsBy({
      dentista: { idDentista },
      dataHora,
      idAgendamento: Not(idAgendamento),
    })
  },
})

// ----- HISTÓRICOS CLÍNICOS -----
export const historicoRepository = AppDataSource.getRepository(HistoricoClinico).extend({
  listarPorPaciente(idPaciente: number) {
    return this.findBy({ paciente: { idPaciente } })
  },
})

// ----- AGENDAS -----
export const agendaRepository = AppDataSource.getRepository(Agenda).extend({
  listarPorDentista(idDentista: number) {
    return this.findBy({ dentista: { idDentista } })
  },
})
