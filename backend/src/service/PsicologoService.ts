// ============================================================
//  PsicologoService.ts — Cadastro dos profissionais
// ============================================================
// Regras de negócio:
//  - CRP único (é o registro profissional, não pode repetir);
//  - cada psicólogo corresponde a exatamente UM usuário do sistema;
//  - a área de atuação precisa ser uma das previstas pelo Conselho;
//  - o psicólogo logado pode editar apenas o PRÓPRIO cadastro.

import { Psicologo, AREAS_DE_ATUACAO, AreaDeAtuacao } from '../entity/Psicologo'
import { PERFIL } from '../entity/Perfil'
import { psicologoRepository, usuarioRepository } from '../repository/repositories'
import {
  ConflitoError,
  NaoAutorizadoError,
  RecursoNaoEncontradoError,
  RequisicaoInvalidaError,
} from '../error/erros'
import { ConteudoDoToken } from '../util/seguranca'
import { ACAO, logService } from './LogService'
import { DadosRecebidos, lerIdRelacionamento, temValor, textoOuNulo } from './tipos'

export const psicologoService = {
  listarTodos(): Promise<Psicologo[]> {
    return psicologoRepository.find({ order: { idPsicologo: 'ASC' } })
  },

  async buscarPorId(id: number): Promise<Psicologo> {
    const psicologo = await psicologoRepository.findOneBy({ idPsicologo: id })
    if (!psicologo) {
      throw new RecursoNaoEncontradoError('Psicólogo não encontrado com id ' + id)
    }
    return psicologo
  },

  /**
   * Descobre qual psicólogo corresponde ao usuário que está logado.
   * É a ponte entre "quem entrou no sistema" e "qual profissional é esse".
   */
  async buscarPeloUsuarioLogado(logado: ConteudoDoToken): Promise<Psicologo> {
    const psicologo = await psicologoRepository.buscarPorUsuario(logado.idUsuario)
    if (!psicologo) {
      throw new RecursoNaoEncontradoError(
        'O seu usuário não está vinculado a um cadastro de psicólogo. Procure o administrador.'
      )
    }
    return psicologo
  },

  /** Cadastra o profissional a partir de um usuário já existente. */
  async criar(dados: DadosRecebidos, idAutor: number): Promise<Psicologo> {
    const idUsuario = lerIdRelacionamento(dados.usuario, 'idUsuario')
    if (idUsuario === null) {
      throw new RequisicaoInvalidaError(
        'É obrigatório informar o usuário do sistema correspondente a este psicólogo.'
      )
    }

    const usuario = await usuarioRepository.findOneBy({ idUsuario })
    if (!usuario) {
      throw new RecursoNaoEncontradoError('Usuário não encontrado com id ' + idUsuario)
    }
    // O cadastro profissional só faz sentido para quem tem o perfil de psicólogo.
    if (usuario.perfil.nome !== PERFIL.PSICOLOGO) {
      throw new RequisicaoInvalidaError(
        'O usuário informado precisa ter o perfil "Psicologo" para ser cadastrado como psicólogo.'
      )
    }
    if (await psicologoRepository.existePorUsuario(idUsuario)) {
      throw new ConflitoError('Este usuário já possui um cadastro de psicólogo.')
    }

    const crp = validarCrp(dados.crp)
    if (await psicologoRepository.existePorCrp(crp)) {
      throw new ConflitoError('Já existe um psicólogo cadastrado com este CRP.')
    }

    const psicologo = new Psicologo()
    psicologo.usuario = usuario
    psicologo.crp = crp
    psicologo.areaAtuacao = validarArea(dados.areaAtuacao)
    psicologo.abordagem = textoOuNulo(dados.abordagem)
    psicologo.telefone = textoOuNulo(dados.telefone)

    const salvo = await psicologoRepository.save(psicologo)

    await logService.registrar({
      idUsuario: idAutor,
      acao: ACAO.CRIAR,
      entidade: 'psicologos',
      idEntidade: salvo.idPsicologo,
      detalhes: `Cadastro do psicólogo ${crp} (${psicologo.areaAtuacao}).`,
    })

    return psicologoService.buscarPorId(salvo.idPsicologo)
  },

  /**
   * Atualiza os dados profissionais.
   *
   * O administrador pode editar qualquer cadastro; o psicólogo, apenas o dele.
   * A verificação é feita AQUI, no back-end, e não depende de o front esconder
   * o botão de editar.
   */
  async atualizar(
    id: number,
    dados: DadosRecebidos,
    logado: ConteudoDoToken
  ): Promise<Psicologo> {
    const psicologo = await psicologoService.buscarPorId(id)

    const ehAdministrador = logado.perfil === PERFIL.ADMINISTRADOR
    const ehODonoDoCadastro = psicologo.usuario.idUsuario === logado.idUsuario
    if (!ehAdministrador && !ehODonoDoCadastro) {
      throw new NaoAutorizadoError('Você só pode alterar o seu próprio cadastro profissional.')
    }

    if (dados.crp !== undefined) {
      // Trocar o CRP é uma correção de cadastro, não algo do dia a dia:
      // por isso fica restrito ao administrador.
      if (!ehAdministrador) {
        throw new NaoAutorizadoError('Somente o administrador pode alterar o CRP.')
      }
      const crp = validarCrp(dados.crp)
      if (await psicologoRepository.existePorCrpComOutroId(crp, id)) {
        throw new ConflitoError('Já existe OUTRO psicólogo cadastrado com este CRP.')
      }
      psicologo.crp = crp
    }

    if (dados.areaAtuacao !== undefined) {
      psicologo.areaAtuacao = validarArea(dados.areaAtuacao)
    }
    if (dados.abordagem !== undefined) {
      psicologo.abordagem = textoOuNulo(dados.abordagem)
    }
    if (dados.telefone !== undefined) {
      psicologo.telefone = textoOuNulo(dados.telefone)
    }

    await psicologoRepository.save(psicologo)

    await logService.registrar({
      idUsuario: logado.idUsuario,
      acao: ACAO.ATUALIZAR,
      entidade: 'psicologos',
      idEntidade: id,
      detalhes: `Dados profissionais do psicólogo ${psicologo.crp} atualizados.`,
    })

    return psicologoService.buscarPorId(id)
  },
}

// ---------------- VALIDAÇÕES ----------------

function validarCrp(valor: unknown): string {
  if (!temValor(valor)) {
    throw new RequisicaoInvalidaError('O CRP é obrigatório.')
  }
  return valor.trim()
}

function validarArea(valor: unknown): AreaDeAtuacao {
  if (typeof valor !== 'string' || !AREAS_DE_ATUACAO.includes(valor as AreaDeAtuacao)) {
    throw new RequisicaoInvalidaError(
      'Área de atuação inválida. As aceitas são: ' + AREAS_DE_ATUACAO.join(', ') + '.'
    )
  }
  return valor as AreaDeAtuacao
}
