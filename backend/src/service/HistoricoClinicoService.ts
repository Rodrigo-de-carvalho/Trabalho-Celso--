import { HistoricoClinico } from '../entity/HistoricoClinico'
import { historicoRepository, pacienteRepository } from '../repository/repositories'
import { RecursoNaoEncontradoError, RequisicaoInvalidaError } from '../error/erros'
import { DadosRecebidos, lerIdRelacionamento, textoOuNulo } from './tipos'

/**
 * Service do Histórico Clínico.
 *
 * Regra de negócio: todo histórico precisa estar ligado a um paciente que existe.
 */
export const historicoClinicoService = {
  listarTodos(): Promise<HistoricoClinico[]> {
    return historicoRepository.find()
  },

  async buscarPorId(id: number): Promise<HistoricoClinico> {
    const historico = await historicoRepository.findOneBy({ idHistorico: id })
    if (!historico) {
      throw new RecursoNaoEncontradoError('Histórico clínico não encontrado com id ' + id)
    }
    return historico
  },

  listarPorPaciente(idPaciente: number): Promise<HistoricoClinico[]> {
    return historicoRepository.listarPorPaciente(idPaciente)
  },

  async criar(dados: DadosRecebidos): Promise<HistoricoClinico> {
    const historico = await montarHistorico(dados)
    return historicoRepository.save(historico)
  },

  async atualizar(id: number, dados: DadosRecebidos): Promise<HistoricoClinico> {
    await historicoClinicoService.buscarPorId(id)
    const historico = await montarHistorico(dados)
    historico.idHistorico = id
    return historicoRepository.save(historico)
  },

  async deletar(id: number): Promise<void> {
    await historicoClinicoService.buscarPorId(id)
    await historicoRepository.delete({ idHistorico: id })
  },
}

// ---------------- REGRAS DE NEGÓCIO ----------------

async function montarHistorico(dados: DadosRecebidos): Promise<HistoricoClinico> {
  const idPaciente = lerIdRelacionamento(dados.paciente, 'idPaciente')
  if (idPaciente === null) {
    throw new RequisicaoInvalidaError('É obrigatório informar o paciente do histórico clínico.')
  }

  const paciente = await pacienteRepository.findOneBy({ idPaciente })
  if (!paciente) {
    throw new RecursoNaoEncontradoError('Paciente não encontrado com id ' + idPaciente)
  }

  const historico = new HistoricoClinico()
  historico.paciente = paciente
  historico.alergias = textoOuNulo(dados.alergias)
  historico.doencasSistemicas = textoOuNulo(dados.doencasSistemicas)
  historico.medicamentosContinuos = textoOuNulo(dados.medicamentosContinuos)
  historico.observacoes = textoOuNulo(dados.observacoes)

  return historico
}
