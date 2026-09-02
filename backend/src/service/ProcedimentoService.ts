import { Procedimento } from '../entity/Procedimento'
import { procedimentoRepository } from '../repository/repositories'
import { RecursoNaoEncontradoError, RequisicaoInvalidaError } from '../error/erros'
import { DadosRecebidos, temValor, textoOuNulo } from './tipos'

/**
 * Service do Procedimento.
 *
 * Regra de negócio: o valor do procedimento não pode ser negativo
 * (é ele que serve de base para o cálculo do valor da consulta).
 */
export const procedimentoService = {
  listarTodos(): Promise<Procedimento[]> {
    return procedimentoRepository.find()
  },

  async buscarPorId(id: number): Promise<Procedimento> {
    const procedimento = await procedimentoRepository.findOneBy({ idProcedimento: id })
    if (!procedimento) {
      throw new RecursoNaoEncontradoError('Procedimento não encontrado com id ' + id)
    }
    return procedimento
  },

  criar(dados: DadosRecebidos): Promise<Procedimento> {
    return procedimentoRepository.save(montarProcedimento(dados))
  },

  async atualizar(id: number, dados: DadosRecebidos): Promise<Procedimento> {
    await procedimentoService.buscarPorId(id)
    const procedimento = montarProcedimento(dados)
    procedimento.idProcedimento = id
    return procedimentoRepository.save(procedimento)
  },

  async deletar(id: number): Promise<void> {
    await procedimentoService.buscarPorId(id)
    await procedimentoRepository.delete({ idProcedimento: id })
  },
}

function montarProcedimento(dados: DadosRecebidos): Procedimento {
  if (!temValor(dados.nome)) {
    throw new RequisicaoInvalidaError('O nome do procedimento é obrigatório.')
  }

  const valor = Number(dados.valor)
  if (Number.isNaN(valor) || valor < 0) {
    throw new RequisicaoInvalidaError('O valor do procedimento deve ser um número maior ou igual a zero.')
  }

  const procedimento = new Procedimento()
  procedimento.nome = dados.nome.trim()
  procedimento.descricao = textoOuNulo(dados.descricao)
  procedimento.valor = valor
  procedimento.tempoEstimado =
    dados.tempoEstimado === null || dados.tempoEstimado === undefined || dados.tempoEstimado === ''
      ? null
      : Number(dados.tempoEstimado)

  return procedimento
}
