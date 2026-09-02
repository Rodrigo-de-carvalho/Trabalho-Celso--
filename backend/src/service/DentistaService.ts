import { Dentista } from '../entity/Dentista'
import { dentistaRepository } from '../repository/repositories'
import { ConflitoError, RecursoNaoEncontradoError, RequisicaoInvalidaError } from '../error/erros'
import { DadosRecebidos, temValor, textoOuNulo } from './tipos'

/**
 * Service do Dentista.
 *
 * Regra de negócio principal: CRO e e-mail precisam ser ÚNICOS.
 */
export const dentistaService = {
  listarTodos(): Promise<Dentista[]> {
    return dentistaRepository.find()
  },

  async buscarPorId(id: number): Promise<Dentista> {
    const dentista = await dentistaRepository.findOneBy({ idDentista: id })
    if (!dentista) {
      throw new RecursoNaoEncontradoError('Dentista não encontrado com id ' + id)
    }
    return dentista
  },

  // Cria um dentista, validando CRO e e-mail únicos antes de salvar.
  async criar(dados: DadosRecebidos): Promise<Dentista> {
    const dentista = montarDentista(dados)
    await validarUnicidadeParaCriacao(dentista)
    return dentistaRepository.save(dentista)
  },

  // Atualiza um dentista existente.
  async atualizar(id: number, dados: DadosRecebidos): Promise<Dentista> {
    await dentistaService.buscarPorId(id)
    const dentista = montarDentista(dados)
    await validarUnicidadeParaEdicao(dentista, id)
    dentista.idDentista = id
    return dentistaRepository.save(dentista)
  },

  async deletar(id: number): Promise<void> {
    await dentistaService.buscarPorId(id)
    await dentistaRepository.delete({ idDentista: id })
  },
}

// ---------------- REGRAS DE NEGÓCIO ----------------

function montarDentista(dados: DadosRecebidos): Dentista {
  if (!temValor(dados.nomeCompleto)) {
    throw new RequisicaoInvalidaError('O nome completo do dentista é obrigatório.')
  }
  if (!temValor(dados.cro)) {
    throw new RequisicaoInvalidaError('O CRO do dentista é obrigatório.')
  }
  if (!temValor(dados.telefone)) {
    throw new RequisicaoInvalidaError('O telefone do dentista é obrigatório.')
  }
  if (!temValor(dados.email)) {
    throw new RequisicaoInvalidaError('O e-mail do dentista é obrigatório.')
  }

  const dentista = new Dentista()
  dentista.nomeCompleto = dados.nomeCompleto.trim()
  dentista.cro = dados.cro.trim()
  dentista.telefone = dados.telefone.trim()
  dentista.email = dados.email.trim()
  dentista.especialidade = textoOuNulo(dados.especialidade)

  return dentista
}

// Na criação: ninguém pode ter CRO ou e-mail repetido.
async function validarUnicidadeParaCriacao(d: Dentista): Promise<void> {
  if (await dentistaRepository.existePorCro(d.cro)) {
    throw new ConflitoError('Já existe um dentista cadastrado com este CRO.')
  }
  if (await dentistaRepository.existePorEmail(d.email)) {
    throw new ConflitoError('Já existe um dentista cadastrado com este e-mail.')
  }
}

// Na edição: ignoramos o próprio dentista (ele pode manter o próprio CRO/e-mail).
async function validarUnicidadeParaEdicao(d: Dentista, id: number): Promise<void> {
  if (await dentistaRepository.existePorCroComOutroId(d.cro, id)) {
    throw new ConflitoError('Já existe OUTRO dentista cadastrado com este CRO.')
  }
  if (await dentistaRepository.existePorEmailComOutroId(d.email, id)) {
    throw new ConflitoError('Já existe OUTRO dentista cadastrado com este e-mail.')
  }
}
