import { PlanoOdontologico } from '../entity/PlanoOdontologico'
import { planoRepository } from '../repository/repositories'
import { RecursoNaoEncontradoError, RequisicaoInvalidaError } from '../error/erros'
import { DadosRecebidos, temValor, textoOuNulo } from './tipos'

/**
 * Service do Plano Odontológico.
 *
 * O "service" é a camada onde ficam as REGRAS DE NEGÓCIO. O controller só recebe
 * a requisição e repassa para cá; o repository só fala com o banco. Assim cada
 * camada tem uma responsabilidade só.
 */
export const planoOdontologicoService = {
  listarTodos(): Promise<PlanoOdontologico[]> {
    return planoRepository.find()
  },

  // Busca um plano pelo id; se não achar, devolve erro 404.
  async buscarPorId(id: number): Promise<PlanoOdontologico> {
    const plano = await planoRepository.findOneBy({ idPlano: id })
    if (!plano) {
      throw new RecursoNaoEncontradoError('Plano odontológico não encontrado com id ' + id)
    }
    return plano
  },

  criar(dados: DadosRecebidos): Promise<PlanoOdontologico> {
    const plano = montarPlano(dados)
    return planoRepository.save(plano)
  },

  async atualizar(id: number, dados: DadosRecebidos): Promise<PlanoOdontologico> {
    await planoOdontologicoService.buscarPorId(id) // garante que o plano existe (senão 404)
    const plano = montarPlano(dados)
    plano.idPlano = id // garante que vamos ATUALIZAR este id
    return planoRepository.save(plano)
  },

  async deletar(id: number): Promise<void> {
    await planoOdontologicoService.buscarPorId(id)
    await planoRepository.delete({ idPlano: id })
  },
}

// Monta a entidade a partir do que veio do frontend, validando o obrigatório.
function montarPlano(dados: DadosRecebidos): PlanoOdontologico {
  if (!temValor(dados.nomePlano)) {
    throw new RequisicaoInvalidaError('O nome do plano é obrigatório.')
  }

  const plano = new PlanoOdontologico()
  plano.nomePlano = dados.nomePlano.trim()
  plano.operadora = textoOuNulo(dados.operadora)
  plano.cobertura = textoOuNulo(dados.cobertura)

  // O desconto pode vir como texto ("20") do formulário; convertemos para número.
  const desconto = Number(dados.descontoPercentual ?? 0)
  if (Number.isNaN(desconto) || desconto < 0 || desconto > 100) {
    throw new RequisicaoInvalidaError('O desconto do plano deve ser um número entre 0 e 100.')
  }
  plano.descontoPercentual = desconto

  return plano
}
