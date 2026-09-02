// ============================================================
//  AuthService.ts — Login e logout
// ============================================================

import { Usuario } from '../entity/Usuario'
import { NomeDePerfil } from '../entity/Perfil'
import { usuarioRepository } from '../repository/repositories'
import { NaoAutenticadoError, RequisicaoInvalidaError } from '../error/erros'
import {
  ConteudoDoToken,
  conferirSenha,
  gerarIdDeToken,
  gerarToken,
} from '../util/seguranca'
import { ACAO, logService } from './LogService'
import { DadosRecebidos, temValor } from './tipos'

/**
 * Lista dos tokens que já passaram pelo logout.
 *
 * Um JWT é válido até expirar, mesmo que o usuário saia do sistema. Para o
 * logout invalidar o token de verdade, guardamos aqui o número de série (jti)
 * dos tokens encerrados, e o middleware de autenticação recusa qualquer um
 * que esteja nesta lista.
 *
 * Como é memória do processo, a lista se perde quando o servidor reinicia —
 * o que, na prática, também invalida os tokens. Em um sistema em produção
 * isso ficaria em um banco rápido (ex: Redis) compartilhado entre servidores.
 */
export const tokensRevogados = new Set<string>()

/** O que a API devolve depois de um login bem-sucedido. */
export interface RespostaDeLogin {
  token: string
  usuario: {
    idUsuario: number
    nomeCompleto: string
    email: string
    perfil: NomeDePerfil
  }
}

export const authService = {
  /**
   * Confere e-mail e senha e devolve o token de acesso.
   *
   * Detalhe importante de segurança: quando o e-mail não existe OU a senha está
   * errada, respondemos exatamente a MESMA mensagem. Se disséssemos "e-mail não
   * encontrado", estaríamos entregando de bandeja quais e-mails têm conta no
   * sistema, o que ajudaria um ataque.
   */
  async login(dados: DadosRecebidos): Promise<RespostaDeLogin> {
    if (!temValor(dados.email) || !temValor(dados.senha)) {
      throw new RequisicaoInvalidaError('Informe o e-mail e a senha.')
    }

    const email = dados.email.trim().toLowerCase()
    const usuario = await usuarioRepository.buscarParaLogin(email)

    const credenciaisInvalidas = new NaoAutenticadoError('E-mail ou senha inválidos.')

    if (!usuario) {
      throw credenciaisInvalidas
    }

    const senhaConfere = await conferirSenha(dados.senha, usuario.senhaHash)
    if (!senhaConfere) {
      await logService.registrar({
        idUsuario: usuario.idUsuario,
        acao: ACAO.LOGIN_NEGADO,
        entidade: 'usuarios',
        idEntidade: usuario.idUsuario,
        detalhes: 'Tentativa de login com senha incorreta.',
      })
      throw credenciaisInvalidas
    }

    // Usuário existe e a senha está certa, mas o acesso pode estar suspenso.
    // Aqui a mensagem PODE ser específica: quem chegou até este ponto já provou
    // ser o dono da conta, então explicar o motivo ajuda e não expõe ninguém.
    if (usuario.situacao !== 'Ativo') {
      await logService.registrar({
        idUsuario: usuario.idUsuario,
        acao: ACAO.LOGIN_NEGADO,
        entidade: 'usuarios',
        idEntidade: usuario.idUsuario,
        detalhes: `Login recusado: usuário ${usuario.situacao}.`,
      })
      throw new NaoAutenticadoError(
        usuario.situacao === 'Bloqueado'
          ? 'Seu acesso está bloqueado. Procure o administrador do sistema.'
          : 'Seu acesso está inativo. Procure o administrador do sistema.'
      )
    }

    // Guarda o momento do último acesso (aparece na listagem do administrador).
    usuario.ultimoAcesso = new Date().toISOString().substring(0, 19)
    await usuarioRepository.save({
      idUsuario: usuario.idUsuario,
      ultimoAcesso: usuario.ultimoAcesso,
    } as Usuario)

    const conteudo: ConteudoDoToken = {
      idUsuario: usuario.idUsuario,
      email: usuario.email,
      perfil: usuario.perfil.nome as NomeDePerfil,
      jti: gerarIdDeToken(),
    }

    await logService.registrar({
      idUsuario: usuario.idUsuario,
      acao: ACAO.LOGIN,
      entidade: 'usuarios',
      idEntidade: usuario.idUsuario,
      detalhes: `Login realizado como ${conteudo.perfil}.`,
    })

    return {
      token: gerarToken(conteudo),
      usuario: {
        idUsuario: usuario.idUsuario,
        nomeCompleto: usuario.nomeCompleto,
        email: usuario.email,
        perfil: conteudo.perfil,
      },
    }
  },

  /** Encerra a sessão invalidando o token atual. */
  async logout(conteudo: ConteudoDoToken): Promise<void> {
    tokensRevogados.add(conteudo.jti)
    await logService.registrar({
      idUsuario: conteudo.idUsuario,
      acao: ACAO.LOGOUT,
      entidade: 'usuarios',
      idEntidade: conteudo.idUsuario,
      detalhes: 'Sessão encerrada pelo usuário.',
    })
  },
}
