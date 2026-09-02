import { Pagamento } from '../entity/Pagamento'
import { consultaRepository, pagamentoRepository } from '../repository/repositories'
import { RecursoNaoEncontradoError, RequisicaoInvalidaError } from '../error/erros'
import { DadosRecebidos, lerIdRelacionamento, temValor, textoOuNulo } from './tipos'

/**
 * Service do Pagamento.
 *
 * Regras de negócio:
 *  - todo pagamento precisa estar ligado a uma consulta que existe;
 *  - o valor pago tem que ser maior que zero;
 *  - se não informarem as parcelas, assumimos 1 (à vista).
 */
export const pagamentoService = {
  listarTodos(): Promise<Pagamento[]> {
    return pagamentoRepository.find()
  },

  async buscarPorId(id: number): Promise<Pagamento> {
    const pagamento = await pagamentoRepository.findOneBy({ idPagamento: id })
    if (!pagamento) {
      throw new RecursoNaoEncontradoError('Pagamento não encontrado com id ' + id)
    }
    return pagamento
  },

  async criar(dados: DadosRecebidos): Promise<Pagamento> {
    const pagamento = await prepararPagamento(dados)
    return pagamentoRepository.save(pagamento)
  },

  async atualizar(id: number, dados: DadosRecebidos): Promise<Pagamento> {
    await pagamentoService.buscarPorId(id)
    const pagamento = await prepararPagamento(dados)
    pagamento.idPagamento = id
    return pagamentoRepository.save(pagamento)
  },

  async deletar(id: number): Promise<void> {
    await pagamentoService.buscarPorId(id)
    await pagamentoRepository.delete({ idPagamento: id })
  },
}

// ---------------- REGRAS DE NEGÓCIO ----------------

// As formas de pagamento aceitas (as mesmas do ENUM criado no schema.sql).
const FORMAS_DE_PAGAMENTO = ['Dinheiro', 'Cartão Débito', 'Cartão Crédito', 'Pix', 'Boleto']

async function prepararPagamento(dados: DadosRecebidos): Promise<Pagamento> {
  const idConsulta = lerIdRelacionamento(dados.consulta, 'idConsulta')
  if (idConsulta === null) {
    throw new RequisicaoInvalidaError('É obrigatório informar a consulta que está sendo paga.')
  }

  const consulta = await consultaRepository.findOneBy({ idConsulta })
  if (!consulta) {
    throw new RecursoNaoEncontradoError('Consulta não encontrada com id ' + idConsulta)
  }

  if (!temValor(dados.formaPagamento) || !FORMAS_DE_PAGAMENTO.includes(dados.formaPagamento)) {
    throw new RequisicaoInvalidaError(
      'Forma de pagamento inválida. As aceitas são: ' + FORMAS_DE_PAGAMENTO.join(', ') + '.'
    )
  }

  const valorPago = Number(dados.valorPago)
  if (Number.isNaN(valorPago) || valorPago <= 0) {
    throw new RequisicaoInvalidaError('O valor pago deve ser maior que zero.')
  }

  const pagamento = new Pagamento()
  pagamento.consulta = consulta
  pagamento.formaPagamento = dados.formaPagamento
  pagamento.valorPago = valorPago
  pagamento.descricao = textoOuNulo(dados.descricao)

  // Se não informaram as parcelas (ou mandaram um número inválido), fica 1 = à vista.
  const parcelas = Number(dados.parcelas)
  pagamento.parcelas = Number.isNaN(parcelas) || parcelas < 1 ? 1 : parcelas

  return pagamento
}
