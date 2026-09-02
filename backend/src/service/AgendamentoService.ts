import { Agendamento } from '../entity/Agendamento'
import {
  agendamentoRepository,
  dentistaRepository,
  pacienteRepository,
  procedimentoRepository,
} from '../repository/repositories'
import { ConflitoError, RecursoNaoEncontradoError, RequisicaoInvalidaError } from '../error/erros'
import { DadosRecebidos, lerIdRelacionamento, temValor, textoOuNulo } from './tipos'

/**
 * Service do Agendamento.
 *
 * Regras de negócio principais:
 *  - paciente, dentista e procedimento informados precisam existir de verdade;
 *  - um mesmo dentista NÃO pode ter dois agendamentos na mesma data/hora
 *    (senão ele estaria em dois lugares ao mesmo tempo).
 */
export const agendamentoService = {
  listarTodos(): Promise<Agendamento[]> {
    return agendamentoRepository.find()
  },

  async buscarPorId(id: number): Promise<Agendamento> {
    const agendamento = await agendamentoRepository.findOneBy({ idAgendamento: id })
    if (!agendamento) {
      throw new RecursoNaoEncontradoError('Agendamento não encontrado com id ' + id)
    }
    return agendamento
  },

  // Cria um agendamento aplicando todas as regras de negócio.
  async criar(dados: DadosRecebidos): Promise<Agendamento> {
    const agendamento = montarAgendamento(dados)  // valida os campos e o status padrão
    await resolverRelacionamentos(agendamento, dados) // confirma que paciente/dentista/procedimento existem
    await validarHorarioLivre(agendamento, null)  // impede horário ocupado pelo mesmo dentista
    return agendamentoRepository.save(agendamento)
  },

  // Atualiza um agendamento existente.
  async atualizar(id: number, dados: DadosRecebidos): Promise<Agendamento> {
    await agendamentoService.buscarPorId(id)
    const agendamento = montarAgendamento(dados)
    await resolverRelacionamentos(agendamento, dados)
    await validarHorarioLivre(agendamento, id)    // na edição, ignora o próprio agendamento
    agendamento.idAgendamento = id
    return agendamentoRepository.save(agendamento)
  },

  async deletar(id: number): Promise<void> {
    await agendamentoService.buscarPorId(id)
    await agendamentoRepository.delete({ idAgendamento: id })
  },
}

// ---------------- REGRAS DE NEGÓCIO ----------------

// Os únicos status aceitos (os mesmos do ENUM criado no schema.sql).
const STATUS_VALIDOS = [
  'Agendado',
  'Cancelado',
  'Remarcado',
  'Paciente Faltou',
  'Atendimento Concluído',
]

function montarAgendamento(dados: DadosRecebidos): Agendamento {
  if (!temValor(dados.dataHora)) {
    throw new RequisicaoInvalidaError('É obrigatório informar a data e a hora do agendamento.')
  }

  const agendamento = new Agendamento()
  agendamento.dataHora = dados.dataHora
  agendamento.observacoes = textoOuNulo(dados.observacoes)

  // Se o status não foi enviado, começamos com "Agendado" (igual ao DEFAULT do banco).
  const status = temValor(dados.status) ? dados.status.trim() : 'Agendado'
  // Conferimos o status na mão: se mandarem um valor que não existe no ENUM do
  // banco, avisamos com 400 em vez de deixar o MySQL quebrar e virar um erro 500.
  if (!STATUS_VALIDOS.includes(status)) {
    throw new RequisicaoInvalidaError(
      'Status inválido. Os valores aceitos são: ' + STATUS_VALIDOS.join(', ') + '.'
    )
  }
  agendamento.status = status

  return agendamento
}

// Garante que o paciente, o dentista e o procedimento informados existem no banco.
// O frontend manda só os ids (ex: { "paciente": { "idPaciente": 1 } }); aqui buscamos
// os objetos completos para o relacionamento ficar correto.
async function resolverRelacionamentos(ag: Agendamento, dados: DadosRecebidos): Promise<void> {
  const idPaciente = lerIdRelacionamento(dados.paciente, 'idPaciente')
  const idDentista = lerIdRelacionamento(dados.dentista, 'idDentista')
  const idProcedimento = lerIdRelacionamento(dados.procedimento, 'idProcedimento')

  if (idPaciente === null) {
    throw new RequisicaoInvalidaError('É obrigatório informar o paciente do agendamento.')
  }
  if (idDentista === null) {
    throw new RequisicaoInvalidaError('É obrigatório informar o dentista do agendamento.')
  }
  if (idProcedimento === null) {
    throw new RequisicaoInvalidaError('É obrigatório informar o procedimento do agendamento.')
  }

  const paciente = await pacienteRepository.findOneBy({ idPaciente })
  if (!paciente) {
    throw new RecursoNaoEncontradoError('Paciente não encontrado com id ' + idPaciente)
  }
  const dentista = await dentistaRepository.findOneBy({ idDentista })
  if (!dentista) {
    throw new RecursoNaoEncontradoError('Dentista não encontrado com id ' + idDentista)
  }
  const procedimento = await procedimentoRepository.findOneBy({ idProcedimento })
  if (!procedimento) {
    throw new RecursoNaoEncontradoError('Procedimento não encontrado com id ' + idProcedimento)
  }

  ag.paciente = paciente
  ag.dentista = dentista
  ag.procedimento = procedimento
}

// Coração da regra: verifica se o dentista já tem outro agendamento NESTE mesmo horário.
// O parâmetro "idIgnorar" serve para, na edição, não comparar o agendamento com ele mesmo.
async function validarHorarioLivre(ag: Agendamento, idIgnorar: number | null): Promise<void> {
  const ocupado =
    idIgnorar === null
      ? await agendamentoRepository.existePorDentistaEDataHora(
          ag.dentista.idDentista,
          ag.dataHora
        )
      : await agendamentoRepository.existePorDentistaEDataHoraComOutroId(
          ag.dentista.idDentista,
          ag.dataHora,
          idIgnorar
        )

  if (ocupado) {
    throw new ConflitoError(
      'Este dentista já possui um agendamento nesta data e horário. Escolha outro horário.'
    )
  }
}
