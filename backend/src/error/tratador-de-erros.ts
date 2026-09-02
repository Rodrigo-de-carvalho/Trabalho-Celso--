// ============================================================
//  tratador-de-erros.ts — "Tratador global de erros" da aplicação
// ============================================================
// A ideia é centralizar AQUI o tratamento dos erros. Assim, quando qualquer parte
// do código lançar uma exceção, este arquivo captura, escolhe o status HTTP correto
// (400, 404, 409...) e devolve um JSON claro para o frontend, em vez de uma página
// de erro genérica e confusa.

import { NextFunction, Request, Response } from 'express'
import { ErroDaAplicacao, ErroResposta } from './erros'

/**
 * Rota não encontrada (ex: o frontend chamou /api/pacientess com dois "s").
 * Fica ANTES do tratador de erros, no final da lista de rotas.
 */
export function rotaNaoEncontrada(req: Request, res: Response<ErroResposta>) {
  res.status(404).json({
    mensagem: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  })
}

/**
 * Middleware de erro do Express.
 *
 * O Express reconhece um middleware como "de erro" porque ele recebe QUATRO
 * parâmetros (erro, req, res, next). Toda vez que um controller chamar
 * next(erro), a execução cai aqui.
 */
export function tratadorDeErros(
  erro: unknown,
  _req: Request,
  res: Response<ErroResposta>,
  _next: NextFunction
) {
  // Se for um dos NOSSOS erros, ele já sabe qual status HTTP usar
  // (404 para não encontrado, 409 para conflito, 400 para dado inválido).
  if (erro instanceof ErroDaAplicacao) {
    res.status(erro.status).json({ mensagem: erro.message })
    return
  }

  // Erro de JSON malformado enviado pelo frontend -> 400 (Bad Request).
  if (erro instanceof SyntaxError && 'body' in erro) {
    res.status(400).json({ mensagem: 'O corpo da requisição não é um JSON válido.' })
    return
  }

  // Rede de segurança: qualquer outro erro inesperado cai aqui -> status 500.
  // Evita que o usuário veja um erro técnico gigante; mostra uma mensagem amigável.
  // No console do servidor, porém, registramos o erro completo para conseguirmos depurar.
  console.error('[ERRO INESPERADO]', erro)
  const detalhe = erro instanceof Error ? erro.message : String(erro)
  res.status(500).json({ mensagem: 'Ocorreu um erro inesperado: ' + detalhe })
}
