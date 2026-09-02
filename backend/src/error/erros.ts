// ============================================================
//  erros.ts — Os tipos de erro que a nossa API sabe tratar
// ============================================================
// Criamos classes próprias de erro para conseguir diferenciar CADA situação e,
// no tratador global, escolher o status HTTP certo para cada uma.

/**
 * Classe base dos nossos erros. Além da mensagem, guarda o status HTTP
 * que deve ser devolvido ao frontend.
 */
export class ErroDaAplicacao extends Error {
  readonly status: number

  constructor(mensagem: string, status: number) {
    super(mensagem)
    this.status = status
    // Necessário no TypeScript para o "instanceof" funcionar com classes de erro.
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** Registro não encontrado no banco -> 404 (Not Found). */
export class RecursoNaoEncontradoError extends ErroDaAplicacao {
  constructor(mensagem: string) {
    super(mensagem, 404)
  }
}

/** Conflito: CPF/CRO/e-mail duplicado, horário ocupado... -> 409 (Conflict). */
export class ConflitoError extends ErroDaAplicacao {
  constructor(mensagem: string) {
    super(mensagem, 409)
  }
}

/** Não está logado, ou o token é inválido/expirado -> 401 (Unauthorized). */
export class NaoAutenticadoError extends ErroDaAplicacao {
  constructor(mensagem: string) {
    super(mensagem, 401)
  }
}

/** Está logado, mas o perfil dele não permite esta operação -> 403 (Forbidden). */
export class NaoAutorizadoError extends ErroDaAplicacao {
  constructor(mensagem: string) {
    super(mensagem, 403)
  }
}

/** Dados inválidos segundo as nossas regras de negócio -> 400 (Bad Request). */
export class RequisicaoInvalidaError extends ErroDaAplicacao {
  constructor(mensagem: string) {
    super(mensagem, 400)
  }
}

/**
 * Formato do JSON de erro devolvido pela API.
 * O frontend lê a chave "mensagem" para mostrar o aviso na tela (ver api.js).
 */
export interface ErroResposta {
  mensagem: string
}
