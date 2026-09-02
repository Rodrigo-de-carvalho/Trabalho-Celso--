// ============================================================
//  tipos.ts — Tipos de apoio para os dados que chegam do frontend
// ============================================================
// O corpo (body) de uma requisição HTTP chega como um objeto qualquer: o
// TypeScript não tem como saber o que veio dentro dele. Por isso usamos o tipo
// "DadosRecebidos" e, nos services, validamos campo por campo antes de salvar.

export type DadosRecebidos = Record<string, any>

/**
 * Lê o id de um relacionamento enviado pelo frontend.
 *
 * O frontend manda os relacionamentos como objetos com o id dentro, por exemplo:
 *     { "paciente": { "idPaciente": 1 } }
 * Esta função pega esse 1 (ou devolve null se não veio nada).
 */
export function lerIdRelacionamento(
  objeto: DadosRecebidos | null | undefined,
  nomeDoCampoId: string
): number | null {
  if (objeto === null || objeto === undefined) return null
  const valor = objeto[nomeDoCampoId]
  if (valor === null || valor === undefined || valor === '') return null
  const numero = Number(valor)
  return Number.isNaN(numero) ? null : numero
}

/** Pequeno auxiliar: retorna true se o texto não é nulo e não está em branco. */
export function temValor(texto: unknown): texto is string {
  return typeof texto === 'string' && texto.trim() !== ''
}

/** Converte para texto ou null (campos opcionais que vêm vazios viram null). */
export function textoOuNulo(valor: unknown): string | null {
  return temValor(valor) ? valor.trim() : null
}
