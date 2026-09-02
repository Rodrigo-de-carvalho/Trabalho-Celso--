// ============================================================
//  acesso.ts — Quem pode ver quais clientes/pacientes
// ============================================================
// Esta é a regra de privacidade central do sistema, e por isso mora em um
// arquivo só: administrador e atendente enxergam todos os registros
// administrativos; o psicólogo enxerga APENAS os pacientes vinculados a ele.
//
// Como a regra está isolada aqui, todos os services usam exatamente a mesma
// verificação — não há risco de uma tela esquecer de aplicá-la.

import { PERFIL } from '../entity/Perfil'
import { NaoAutorizadoError } from '../error/erros'
import { psicologoRepository, vinculoRepository } from '../repository/repositories'
import { ConteudoDoToken } from '../util/seguranca'

/**
 * Descreve o alcance de quem está logado:
 *  - "todos": vê todos os clientes/pacientes (administrador e atendente);
 *  - "vinculados": vê só os do próprio psicólogo (a lista de ids vem junto).
 */
export type EscopoDeAcesso =
  | { tipo: 'todos' }
  | { tipo: 'vinculados'; idPsicologo: number; idsClientesPermitidos: number[] }

/** Monta o escopo de acesso do usuário que está fazendo a requisição. */
export async function obterEscopo(logado: ConteudoDoToken): Promise<EscopoDeAcesso> {
  if (logado.perfil !== PERFIL.PSICOLOGO) {
    return { tipo: 'todos' }
  }

  const psicologo = await psicologoRepository.buscarPorUsuario(logado.idUsuario)
  if (!psicologo) {
    // Usuário com perfil de psicólogo mas sem cadastro profissional ainda:
    // por segurança, não vê nenhum paciente (lista vazia) em vez de ver todos.
    return { tipo: 'vinculados', idPsicologo: 0, idsClientesPermitidos: [] }
  }

  const vinculos = await vinculoRepository.listarAtivosPorPsicologo(psicologo.idPsicologo)
  return {
    tipo: 'vinculados',
    idPsicologo: psicologo.idPsicologo,
    idsClientesPermitidos: vinculos.map((v) => v.cliente.idCliente),
  }
}

/** Diz se o escopo permite enxergar um cliente específico. */
export function podeVerCliente(escopo: EscopoDeAcesso, idCliente: number): boolean {
  return escopo.tipo === 'todos' || escopo.idsClientesPermitidos.includes(idCliente)
}

/**
 * Igual à função acima, mas já interrompe a operação com 403 quando o acesso
 * não é permitido. É a forma usada pelos services.
 */
export function exigirAcessoAoCliente(escopo: EscopoDeAcesso, idCliente: number): void {
  if (!podeVerCliente(escopo, idCliente)) {
    throw new NaoAutorizadoError(
      'Você não tem permissão para acessar os dados deste cliente/paciente.'
    )
  }
}
