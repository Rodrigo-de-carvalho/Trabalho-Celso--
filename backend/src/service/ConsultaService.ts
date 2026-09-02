import { Consulta } from '../entity/Consulta'
import { Paciente } from '../entity/Paciente'
import { Procedimento } from '../entity/Procedimento'
import { agendamentoRepository, consultaRepository } from '../repository/repositories'
import { RecursoNaoEncontradoError, RequisicaoInvalidaError } from '../error/erros'
import { arredondarDinheiro, dataHoraTransformer } from '../util/transformers'
import { DadosRecebidos, lerIdRelacionamento, temValor, textoOuNulo } from './tipos'

/**
 * Service da Consulta.
 *
 * Regra de negócio principal deste service:
 * o valorTotal da consulta é CALCULADO automaticamente a partir do valor do
 * procedimento, aplicando o desconto do plano odontológico do paciente (se houver).
 *
 * Para simplificar, a consulta é criada a partir de um AGENDAMENTO: pegamos o
 * paciente, o dentista e o procedimento direto do agendamento (assim os dados
 * ficam sempre consistentes com o que foi marcado).
 */
export const consultaService = {
  listarTodos(): Promise<Consulta[]> {
    return consultaRepository.find()
  },

  async buscarPorId(id: number): Promise<Consulta> {
    const consulta = await consultaRepository.findOneBy({ idConsulta: id })
    if (!consulta) {
      throw new RecursoNaoEncontradoError('Consulta não encontrada com id ' + id)
    }
    return consulta
  },

  // Cria uma consulta a partir de um agendamento e calcula o valor total.
  async criar(dados: DadosRecebidos): Promise<Consulta> {
    const consulta = await prepararConsulta(dados) // busca o agendamento, copia os dados e calcula o valor
    return consultaRepository.save(consulta)
  },

  // Atualiza uma consulta existente (recalcula o valor por garantia).
  async atualizar(id: number, dados: DadosRecebidos): Promise<Consulta> {
    await consultaService.buscarPorId(id)
    const consulta = await prepararConsulta(dados)
    consulta.idConsulta = id
    return consultaRepository.save(consulta)
  },

  async deletar(id: number): Promise<void> {
    await consultaService.buscarPorId(id)
    await consultaRepository.delete({ idConsulta: id })
  },
}

// ---------------- REGRAS DE NEGÓCIO ----------------

// Prepara a consulta antes de salvar:
// 1) confirma que o agendamento existe;
// 2) copia paciente, dentista e procedimento do agendamento;
// 3) calcula o valorTotal com o desconto do plano.
async function prepararConsulta(dados: DadosRecebidos): Promise<Consulta> {
  const idAgendamento = lerIdRelacionamento(dados.agendamento, 'idAgendamento')
  if (idAgendamento === null) {
    throw new RequisicaoInvalidaError('É obrigatório informar o agendamento que originou a consulta.')
  }

  // Busca o agendamento completo no banco.
  const agendamento = await agendamentoRepository.findOneBy({ idAgendamento })
  if (!agendamento) {
    throw new RecursoNaoEncontradoError('Agendamento não encontrado com id ' + idAgendamento)
  }

  const consulta = new Consulta()

  // Copiamos as "peças" do agendamento para a consulta (mantém tudo consistente).
  consulta.agendamento = agendamento
  consulta.paciente = agendamento.paciente
  consulta.dentista = agendamento.dentista
  consulta.procedimento = agendamento.procedimento
  consulta.observacoes = textoOuNulo(dados.observacoes)

  // Se não informaram a data/hora de realização, usamos o momento atual.
  consulta.dataHoraRealizacao = temValor(dados.dataHoraRealizacao)
    ? dados.dataHoraRealizacao
    : (dataHoraTransformer.from(new Date()) as string)

  // Calcula o valor final aplicando o desconto do plano.
  consulta.valorTotal = calcularValorTotal(agendamento.procedimento, agendamento.paciente)

  return consulta
}

// Cálculo do valor total:
//   valorFinal = valorDoProcedimento - (valorDoProcedimento * desconto% / 100)
// Se o paciente não tem plano (ou o plano não dá desconto), paga o valor cheio.
function calcularValorTotal(procedimento: Procedimento, paciente: Paciente): number {
  const valorBase = Number(procedimento.valor)

  // Desconto começa em zero (paciente particular).
  const descontoPercentual = Number(paciente.plano?.descontoPercentual ?? 0)

  // Calcula quanto vale o desconto em reais e subtrai do valor base.
  const valorDoDesconto = (valorBase * descontoPercentual) / 100
  const valorFinal = valorBase - valorDoDesconto

  // Arredonda para 2 casas decimais (centavos).
  return arredondarDinheiro(valorFinal)
}
