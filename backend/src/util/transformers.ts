// ============================================================
//  transformers.ts — Conversores entre o formato do BANCO e o do JAVASCRIPT
// ============================================================
// O driver do MySQL nem sempre devolve os valores no formato que a gente quer
// mandar no JSON. Um "transformer" do TypeORM é um par de funções:
//   - to(...)   -> converte na hora de GRAVAR no banco;
//   - from(...) -> converte na hora de LER do banco.

import { ValueTransformer } from 'typeorm'

/**
 * Colunas DECIMAL (dinheiro e percentual).
 *
 * O MySQL devolve DECIMAL como TEXTO (ex: "150.00") para não perder precisão.
 * Se mandássemos isso direto no JSON, o frontend receberia uma string em vez de
 * um número. Aqui convertemos para number na leitura.
 */
export const decimalTransformer: ValueTransformer = {
  to: (valor: number | null) => valor,
  from: (valor: string | null) => (valor === null ? null : Number(valor)),
}

/**
 * Colunas DATETIME / TIMESTAMP.
 *
 * O driver devolve um objeto Date do JavaScript. Se ele fosse convertido em JSON
 * automaticamente, viraria algo como "2024-05-10T13:00:00.000Z" (em UTC), o que
 * BAGUNÇA o horário mostrado na tela. Por isso formatamos na mão como
 * "2024-05-10T13:00:00" (mesmo formato que o input datetime-local do HTML usa).
 */
export const dataHoraTransformer: ValueTransformer = {
  // Ao gravar: o frontend manda "2024-05-10T13:00"; o Date entende esse texto
  // como horário LOCAL, que é exatamente o que queremos guardar.
  to: (valor: string | Date | null | undefined) => {
    if (valor === null || valor === undefined) return valor
    return valor instanceof Date ? valor : new Date(valor)
  },

  // Ao ler: monta o texto "AAAA-MM-DDTHH:MM:SS" a partir do Date.
  from: (valor: Date | null) => {
    if (valor === null || valor === undefined) return valor
    const doisDigitos = (n: number) => String(n).padStart(2, '0')
    return (
      valor.getFullYear() +
      '-' + doisDigitos(valor.getMonth() + 1) +
      '-' + doisDigitos(valor.getDate()) +
      'T' + doisDigitos(valor.getHours()) +
      ':' + doisDigitos(valor.getMinutes()) +
      ':' + doisDigitos(valor.getSeconds())
    )
  },
}

/**
 * Arredonda um valor em dinheiro para 2 casas decimais (centavos).
 *
 * Em JavaScript, contas com números quebrados podem gerar sobras
 * (ex: 0.1 + 0.2 = 0.30000000000000004). Como aqui lidamos com REAIS, sempre
 * arredondamos o resultado final para 2 casas antes de salvar.
 */
export function arredondarDinheiro(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}
