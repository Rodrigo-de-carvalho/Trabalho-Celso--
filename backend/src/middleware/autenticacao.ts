// ============================================================
//  autenticacao.ts — Quem é você? e O que você pode fazer?
// ============================================================
// Este arquivo tem os dois "porteiros" da API:
//
//   autenticar  -> confere o token e descobre QUEM está chamando (401 se não dá).
//   autorizar   -> confere se esse alguém tem PERMISSÃO para a rota (403 se não).
//
// Regra de ouro do edital: a autorização é sempre verificada AQUI, no back-end.
// Esconder um botão no front-end não protege nada — quem quiser pode chamar a
// API direto. O front esconde por conforto; o back bloqueia de verdade.

import { NextFunction, Request, Response } from 'express'
import { NaoAutenticadoError, NaoAutorizadoError } from '../error/erros'
import { ConteudoDoToken, lerToken } from '../util/seguranca'
import { tokensRevogados } from '../service/AuthService'

/**
 * Acrescenta o campo "usuarioLogado" ao objeto de requisição do Express.
 * Assim, depois do middleware autenticar, qualquer controller pode consultar
 * req.usuarioLogado com o TypeScript sabendo exatamente o que tem lá dentro.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuarioLogado?: ConteudoDoToken
    }
  }
}

/**
 * Confere o token enviado no cabeçalho "Authorization: Bearer <token>".
 * Toda rota interna passa por aqui antes de qualquer coisa.
 */
export function autenticar(req: Request, _res: Response, next: NextFunction) {
  const cabecalho = req.headers.authorization

  if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
    throw new NaoAutenticadoError('É necessário estar autenticado para acessar esta página.')
  }

  const token = cabecalho.substring('Bearer '.length).trim()

  let conteudo: ConteudoDoToken
  try {
    // Se o token foi adulterado ou já expirou, esta linha lança erro.
    conteudo = lerToken(token)
  } catch {
    throw new NaoAutenticadoError('Sessão inválida ou expirada. Faça login novamente.')
  }

  // Token que passou pelo logout não vale mais, mesmo dentro do prazo.
  if (tokensRevogados.has(conteudo.jti)) {
    throw new NaoAutenticadoError('Sessão encerrada. Faça login novamente.')
  }

  req.usuarioLogado = conteudo
  next()
}

/**
 * Libera a rota apenas para os perfis informados.
 * Uso: router.get('/', autenticar, autorizar(PERFIL.ADMINISTRADOR), ...)
 */
export function autorizar(...perfisPermitidos: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const usuario = req.usuarioLogado
    if (!usuario) {
      throw new NaoAutenticadoError('É necessário estar autenticado para acessar esta página.')
    }
    if (!perfisPermitidos.includes(usuario.perfil)) {
      throw new NaoAutorizadoError('Você não tem permissão para executar esta operação.')
    }
    next()
  }
}
