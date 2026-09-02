import { Agenda } from '../entity/Agenda'
import { agendaRepository, dentistaRepository } from '../repository/repositories'
import { RecursoNaoEncontradoError, RequisicaoInvalidaError } from '../error/erros'
import { DadosRecebidos, lerIdRelacionamento, temValor } from './tipos'

/**
 * Service da Agenda (blocos de horário de trabalho do dentista).
 *
 * Regras de negócio:
 *  - o dentista informado precisa existir;
 *  - a hora de fim tem que ser depois da hora de início.
 */
export const agendaService = {
  listarTodos(): Promise<Agenda[]> {
    return agendaRepository.find()
  },

  async buscarPorId(id: number): Promise<Agenda> {
    const agenda = await agendaRepository.findOneBy({ idAgenda: id })
    if (!agenda) {
      throw new RecursoNaoEncontradoError('Agenda não encontrada com id ' + id)
    }
    return agenda
  },

  listarPorDentista(idDentista: number): Promise<Agenda[]> {
    return agendaRepository.listarPorDentista(idDentista)
  },

  async criar(dados: DadosRecebidos): Promise<Agenda> {
    const agenda = await prepararAgenda(dados)
    return agendaRepository.save(agenda)
  },

  async atualizar(id: number, dados: DadosRecebidos): Promise<Agenda> {
    await agendaService.buscarPorId(id)
    const agenda = await prepararAgenda(dados)
    agenda.idAgenda = id
    return agendaRepository.save(agenda)
  },

  async deletar(id: number): Promise<void> {
    await agendaService.buscarPorId(id)
    await agendaRepository.delete({ idAgenda: id })
  },
}

// ---------------- REGRAS DE NEGÓCIO ----------------

async function prepararAgenda(dados: DadosRecebidos): Promise<Agenda> {
  const idDentista = lerIdRelacionamento(dados.dentista, 'idDentista')
  if (idDentista === null) {
    throw new RequisicaoInvalidaError('É obrigatório informar o dentista da agenda.')
  }

  const dentista = await dentistaRepository.findOneBy({ idDentista })
  if (!dentista) {
    throw new RecursoNaoEncontradoError('Dentista não encontrado com id ' + idDentista)
  }

  if (!temValor(dados.data)) {
    throw new RequisicaoInvalidaError('É obrigatório informar a data da agenda.')
  }
  if (!temValor(dados.horaInicio) || !temValor(dados.horaFim)) {
    throw new RequisicaoInvalidaError('É obrigatório informar a hora de início e a hora de fim.')
  }
  // Comparar "HH:MM" como texto funciona porque o formato tem sempre o mesmo
  // tamanho e é ordenado (ex: "09:00" < "17:30").
  if (dados.horaFim <= dados.horaInicio) {
    throw new RequisicaoInvalidaError('A hora de fim deve ser posterior à hora de início.')
  }

  const agenda = new Agenda()
  agenda.dentista = dentista
  agenda.data = dados.data
  agenda.horaInicio = dados.horaInicio
  agenda.horaFim = dados.horaFim
  // Se não disseram nada, o horário nasce disponível (igual ao DEFAULT TRUE do banco).
  agenda.disponivel = dados.disponivel === undefined || dados.disponivel === null
    ? true
    : Boolean(dados.disponivel)

  return agenda
}
