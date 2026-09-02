// ============================================================
//  UsuarioService.ts — Gestão de usuários (área do administrador)
// ============================================================
// Regras de negócio implementadas aqui (todas vindas do edital):
//  - e-mail único;
//  - senha sempre guardada como hash, nunca em texto puro;
//  - somente o administrador ativa, bloqueia, libera ou troca o perfil;
//  - NINGUÉM pode alterar o próprio perfil ou a própria situação
//    (é isso que impede um usuário de "se promover" a administrador);
//  - usuários não são apagados, apenas inativados (preserva o histórico).

import { Usuario, SITUACOES_USUARIO, SituacaoUsuario } from '../entity/Usuario'
import { Perfil } from '../entity/Perfil'
import { perfilRepository, usuarioRepository } from '../repository/repositories'
import {
  ConflitoError,
  RecursoNaoEncontradoError,
  RequisicaoInvalidaError,
} from '../error/erros'
import { gerarHashDaSenha } from '../util/seguranca'
import { ACAO, logService } from './LogService'
import { DadosRecebidos, lerIdRelacionamento, temValor } from './tipos'

const TAMANHO_MINIMO_DA_SENHA = 6

export const usuarioService = {
  /** Lista os usuários, com filtro opcional por situação e por texto. */
  async listar(filtros: { situacao?: string; termo?: string }): Promise<Usuario[]> {
    const usuarios = await usuarioRepository.find({ order: { nomeCompleto: 'ASC' } })

    return usuarios.filter((u) => {
      const passaSituacao = !filtros.situacao || u.situacao === filtros.situacao
      const termo = (filtros.termo ?? '').trim().toLowerCase()
      const passaTermo =
        termo === '' ||
        u.nomeCompleto.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo)
      return passaSituacao && passaTermo
    })
  },

  async buscarPorId(id: number): Promise<Usuario> {
    const usuario = await usuarioRepository.findOneBy({ idUsuario: id })
    if (!usuario) {
      throw new RecursoNaoEncontradoError('Usuário não encontrado com id ' + id)
    }
    return usuario
  },

  /** Cadastra um novo usuário (operação exclusiva do administrador). */
  async criar(dados: DadosRecebidos, idAutor: number): Promise<Usuario> {
    if (!temValor(dados.nomeCompleto)) {
      throw new RequisicaoInvalidaError('O nome completo é obrigatório.')
    }
    const email = validarEmail(dados.email)
    validarSenha(dados.senha)

    if (await usuarioRepository.existePorEmail(email)) {
      throw new ConflitoError('Já existe um usuário cadastrado com este e-mail.')
    }

    const usuario = new Usuario()
    usuario.nomeCompleto = dados.nomeCompleto.trim()
    usuario.email = email
    // A senha em texto puro morre aqui: só o hash segue para o banco.
    usuario.senhaHash = await gerarHashDaSenha(dados.senha)
    usuario.perfil = await buscarPerfil(dados)
    usuario.situacao = validarSituacao(dados.situacao ?? 'Ativo')
    usuario.ultimoAcesso = null

    const salvo = await usuarioRepository.save(usuario)

    await logService.registrar({
      idUsuario: idAutor,
      acao: ACAO.CRIAR,
      entidade: 'usuarios',
      idEntidade: salvo.idUsuario,
      detalhes: `Usuário ${salvo.email} criado com o perfil ${salvo.perfil.nome}.`,
    })

    // Devolve o registro já sem o hash da senha.
    return usuarioService.buscarPorId(salvo.idUsuario)
  },

  /**
   * Atualiza um usuário. É um PATCH: só mexe no que veio no corpo da requisição.
   *
   * Esta função concentra a regra mais sensível do sistema — a de que ninguém
   * pode aumentar o próprio poder. Por isso ela recebe quem está fazendo a
   * alteração (idAutor) e compara com o alvo.
   */
  async atualizar(id: number, dados: DadosRecebidos, idAutor: number): Promise<Usuario> {
    const usuario = await usuarioService.buscarPorId(id)
    const alterandoASiMesmo = id === idAutor
    const mudancas: string[] = []

    if (dados.nomeCompleto !== undefined) {
      if (!temValor(dados.nomeCompleto)) {
        throw new RequisicaoInvalidaError('O nome completo não pode ficar vazio.')
      }
      usuario.nomeCompleto = dados.nomeCompleto.trim()
      mudancas.push('nome')
    }

    if (dados.email !== undefined) {
      const email = validarEmail(dados.email)
      if (await usuarioRepository.existePorEmailComOutroId(email, id)) {
        throw new ConflitoError('Já existe OUTRO usuário cadastrado com este e-mail.')
      }
      usuario.email = email
      mudancas.push('e-mail')
    }

    // ---- A regra que impede a escalada de privilégio ----
    if (dados.perfil !== undefined) {
      if (alterandoASiMesmo) {
        throw new RequisicaoInvalidaError(
          'Você não pode alterar o seu próprio perfil de acesso. Peça a outro administrador.'
        )
      }
      usuario.perfil = await buscarPerfil(dados)
      mudancas.push('perfil')
    }

    if (dados.situacao !== undefined) {
      if (alterandoASiMesmo) {
        throw new RequisicaoInvalidaError(
          'Você não pode alterar a sua própria situação de acesso.'
        )
      }
      usuario.situacao = validarSituacao(dados.situacao)
      mudancas.push('situação')
    }

    // Redefinição de senha: o administrador DEFINE uma nova, nunca consulta a atual.
    if (dados.senha !== undefined) {
      validarSenha(dados.senha)
      usuario.senhaHash = await gerarHashDaSenha(dados.senha)
      mudancas.push('senha')
    }

    if (mudancas.length === 0) {
      throw new RequisicaoInvalidaError('Nenhum campo foi enviado para atualização.')
    }

    await usuarioRepository.save(usuario)

    // Escolhe a ação da auditoria de acordo com o que foi mexido: trocar a
    // situação de alguém é mais grave do que corrigir um nome, e a auditoria
    // precisa deixar isso claro para o administrador que for consultar depois.
    let acao: string = ACAO.ATUALIZAR
    if (mudancas.includes('situação')) acao = ACAO.ALTERAR_SITUACAO
    else if (mudancas.includes('perfil')) acao = ACAO.ALTERAR_PERFIL
    else if (mudancas.includes('senha') && mudancas.length === 1) acao = ACAO.REDEFINIR_SENHA

    await logService.registrar({
      idUsuario: idAutor,
      acao,
      entidade: 'usuarios',
      idEntidade: id,
      detalhes:
        `Alterado(s): ${mudancas.join(', ')}.` +
        (mudancas.includes('situação') ? ` Nova situação: ${usuario.situacao}.` : ''),
    })

    return usuarioService.buscarPorId(id)
  },

  /** Números que aparecem no topo do painel do administrador. */
  async contarPorSituacao(): Promise<Record<SituacaoUsuario | 'total', number>> {
    const [ativos, inativos, bloqueados] = await Promise.all([
      usuarioRepository.contarPorSituacao('Ativo'),
      usuarioRepository.contarPorSituacao('Inativo'),
      usuarioRepository.contarPorSituacao('Bloqueado'),
    ])
    return {
      Ativo: ativos,
      Inativo: inativos,
      Bloqueado: bloqueados,
      total: ativos + inativos + bloqueados,
    }
  },
}

// ---------------- VALIDAÇÕES ----------------

function validarEmail(valor: unknown): string {
  if (!temValor(valor)) {
    throw new RequisicaoInvalidaError('O e-mail é obrigatório.')
  }
  const email = valor.trim().toLowerCase()
  // Conferência simples de formato: algo@algo.algo
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new RequisicaoInvalidaError('Informe um e-mail válido.')
  }
  return email
}

function validarSenha(valor: unknown): void {
  if (!temValor(valor) || valor.length < TAMANHO_MINIMO_DA_SENHA) {
    throw new RequisicaoInvalidaError(
      `A senha deve ter pelo menos ${TAMANHO_MINIMO_DA_SENHA} caracteres.`
    )
  }
}

function validarSituacao(valor: unknown): SituacaoUsuario {
  if (typeof valor !== 'string' || !SITUACOES_USUARIO.includes(valor as SituacaoUsuario)) {
    throw new RequisicaoInvalidaError(
      'Situação inválida. Os valores aceitos são: ' + SITUACOES_USUARIO.join(', ') + '.'
    )
  }
  return valor as SituacaoUsuario
}

async function buscarPerfil(dados: DadosRecebidos): Promise<Perfil> {
  const idPerfil = lerIdRelacionamento(dados.perfil, 'idPerfil')
  if (idPerfil === null) {
    throw new RequisicaoInvalidaError('É obrigatório informar o perfil de acesso do usuário.')
  }
  const perfil = await perfilRepository.findOneBy({ idPerfil })
  if (!perfil) {
    throw new RecursoNaoEncontradoError('Perfil não encontrado com id ' + idPerfil)
  }
  return perfil
}
