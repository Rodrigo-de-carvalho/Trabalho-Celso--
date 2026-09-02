// ============================================================
//  seguranca.ts — Senhas e tokens de login
// ============================================================
// Concentramos aqui as duas peças de segurança do sistema:
//   1) o HASH da senha (bcrypt);
//   2) o TOKEN de login (JWT).
// Manter isso num arquivo só facilita revisar se a segurança está correta.

import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { NomeDePerfil } from '../entity/Perfil'

// Quantas "rodadas" o bcrypt usa para embaralhar a senha. Quanto maior, mais
// lento e mais difícil de quebrar por força bruta. 10 é o valor recomendado.
const RODADAS_DO_HASH = 10

/**
 * Transforma a senha digitada em um hash.
 *
 * Hash é um caminho de MÃO ÚNICA: dá para verificar se uma senha bate com o
 * hash, mas é inviável descobrir a senha a partir dele. Por isso, nem mesmo o
 * administrador consegue ver a senha de alguém — ele só pode redefini-la.
 */
export function gerarHashDaSenha(senhaEmTextoPuro: string): Promise<string> {
  return bcrypt.hash(senhaEmTextoPuro, RODADAS_DO_HASH)
}

/** Confere se a senha digitada no login corresponde ao hash salvo no banco. */
export function conferirSenha(senhaEmTextoPuro: string, hashSalvo: string): Promise<boolean> {
  return bcrypt.compare(senhaEmTextoPuro, hashSalvo)
}

/**
 * O que vai DENTRO do token de login.
 *
 * Guardamos apenas o essencial para identificar quem está usando o sistema.
 * Nada de senha aqui: o conteúdo de um JWT é apenas codificado (e legível por
 * quem tiver o token), não criptografado.
 */
export interface ConteudoDoToken {
  idUsuario: number
  email: string
  perfil: NomeDePerfil
  // "jti" (JWT ID) é um número de série do token. É ele que permite invalidar
  // um token específico no logout (ver AuthService).
  jti: string
}

function segredo(): string {
  const valor = process.env.JWT_SECRET
  // Se o segredo não estiver configurado, é melhor a aplicação parar do que
  // assinar tokens com um valor previsível — isso seria uma falha de segurança.
  if (!valor || valor.trim() === '') {
    throw new Error('JWT_SECRET não configurado. Copie o arquivo .env.example para .env.')
  }
  return valor
}

/** Cria o token que o frontend guarda e envia em cada requisição. */
export function gerarToken(conteudo: ConteudoDoToken): string {
  const opcoes: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRACAO ?? '8h') as SignOptions['expiresIn'],
  }
  return jwt.sign(conteudo, segredo(), opcoes)
}

/**
 * Confere a assinatura e o prazo de validade do token.
 * Se o token foi adulterado ou expirou, esta função lança um erro.
 */
export function lerToken(token: string): ConteudoDoToken {
  return jwt.verify(token, segredo()) as ConteudoDoToken
}

/** Gera o número de série (jti) de um token novo. */
export function gerarIdDeToken(): string {
  return (
    Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
  )
}
