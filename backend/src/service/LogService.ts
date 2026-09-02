// ============================================================
//  LogService.ts — Registro de auditoria
// ============================================================
// Toda operação relevante do sistema (login, cadastro, bloqueio de usuário,
// confirmação de atendimento...) passa por aqui e vira uma linha na tabela
// logs_acoes. É isso que permite ao administrador responder "quem fez isso?".
//
// Repare que NÃO existe método de apagar log: pelo edital, o administrador
// não pode remover registros de auditoria.

import { LogAcao } from '../entity/LogAcao'
import { Usuario } from '../entity/Usuario'
import { logRepository } from '../repository/repositories'

/** As ações que o sistema registra. */
export const ACAO = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_NEGADO: 'LOGIN_NEGADO',
  CRIAR: 'CRIAR',
  ATUALIZAR: 'ATUALIZAR',
  ALTERAR_SITUACAO: 'ALTERAR_SITUACAO',
  ALTERAR_PERFIL: 'ALTERAR_PERFIL',
  REDEFINIR_SENHA: 'REDEFINIR_SENHA',
  VINCULAR: 'VINCULAR',
  DESVINCULAR: 'DESVINCULAR',
  CONFIRMAR: 'CONFIRMAR',
} as const

export const logService = {
  /**
   * Grava uma ação na auditoria.
   *
   * Se por algum motivo o registro falhar, apenas avisamos no console: uma
   * falha ao AUDITAR não pode derrubar a operação que o usuário pediu.
   */
  async registrar(dados: {
    idUsuario: number | null
    acao: string
    entidade: string
    idEntidade?: number | null
    detalhes?: string | null
  }): Promise<void> {
    try {
      const log = new LogAcao()
      log.usuario = dados.idUsuario === null ? null : ({ idUsuario: dados.idUsuario } as Usuario)
      log.acao = dados.acao
      log.entidade = dados.entidade
      log.idEntidade = dados.idEntidade ?? null
      // Corta o detalhe no tamanho da coluna para nunca estourar o VARCHAR(255).
      log.detalhes = dados.detalhes ? dados.detalhes.substring(0, 255) : null
      await logRepository.save(log)
    } catch (erro) {
      console.error('[AVISO] Não foi possível registrar a ação na auditoria:', erro)
    }
  },

  /** Lista os registros mais recentes primeiro (consulta exclusiva do administrador). */
  listar(limite = 200): Promise<LogAcao[]> {
    return logRepository.find({
      order: { idLog: 'DESC' },
      take: Math.min(Math.max(limite, 1), 500),
    })
  },
}
