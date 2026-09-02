// ============================================================
//  formatar.ts — Deixa datas e textos legíveis na tela
// ============================================================
// A API devolve as datas no formato do banco ("2026-09-08T09:00:00"), que é
// ótimo para o computador e ruim para a pessoa. Aqui convertemos para o
// formato brasileiro.

/** "2026-09-08T09:00:00" -> "08/09/2026 09:00" */
export function formatarDataHora(valor: string | null): string {
  if (!valor) return '—'
  const [data, hora = ''] = valor.split('T')
  return `${formatarData(data)} ${hora.substring(0, 5)}`.trim()
}

/** "2026-09-08" -> "08/09/2026" */
export function formatarData(valor: string | null): string {
  if (!valor) return '—'
  const [ano, mes, dia] = valor.substring(0, 10).split('-')
  if (!ano || !mes || !dia) return valor
  return `${dia}/${mes}/${ano}`
}

/** Calcula a idade a partir da data de nascimento (para a lista de pacientes). */
export function calcularIdade(dataNascimento: string | null): string {
  if (!dataNascimento) return '—'
  const nascimento = new Date(dataNascimento + 'T00:00:00')
  const hoje = new Date()

  let idade = hoje.getFullYear() - nascimento.getFullYear()
  // Se ainda não fez aniversário este ano, tira um ano da conta.
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())
  if (aindaNaoFezAniversario) idade--

  return idade + ' anos'
}
