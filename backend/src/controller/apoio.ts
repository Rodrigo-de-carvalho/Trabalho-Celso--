// ============================================================
//  apoio.ts — Funções de apoio usadas por TODOS os controllers
// ============================================================

import { NextFunction, Request, RequestHandler, Response } from 'express'
import { RequisicaoInvalidaError } from '../error/erros'

/**
 * "Embrulha" uma função assíncrona (async) de rota.
 *
 * O Express (versão 4) não percebe sozinho quando um erro acontece dentro de uma
 * função async — o erro simplesmente se perde e a requisição fica travada. Esta
 * função resolve isso: se der erro, ela chama next(erro), que leva a execução
 * direto para o nosso tratador global (error/tratador-de-erros.ts).
 */
export function rota(
  manipulador: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    manipulador(req, res, next).catch(next)
  }
}

/**
 * Lê o id que veio no endereço (ex: o "5" de /api/patients/5) e garante que é
 * mesmo um número. Se alguém chamar /api/patients/abc, devolvemos 400 com uma
 * mensagem clara em vez de deixar o erro estourar lá no banco.
 */
export function lerIdDaUrl(req: Request, nomeDoParametro = 'id'): number {
  const id = Number(req.params[nomeDoParametro])
  if (!Number.isInteger(id) || id <= 0) {
    throw new RequisicaoInvalidaError('O id informado no endereço deve ser um número inteiro.')
  }
  return id
}

/**
 * Lê um parâmetro de texto da URL (a parte depois do "?", como ?termo=ana).
 *
 * O Express entrega esse valor como texto, lista ou objeto, dependendo do que
 * a pessoa digitar na URL. Aqui aceitamos apenas texto simples e ignoramos o
 * resto — assim nenhum service recebe um tipo inesperado.
 */
export function textoDaQuery(req: Request, nome: string): string | undefined {
  const valor = req.query[nome]
  return typeof valor === 'string' ? valor : undefined
}
