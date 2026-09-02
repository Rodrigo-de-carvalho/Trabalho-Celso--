// ============================================================
//  tipos.ts — O formato dos dados que a API devolve
// ============================================================
// Descrever aqui, uma única vez, o formato de cada registro faz o TypeScript
// conferir as telas para nós: se alguém escrever "paciente.nome" em vez de
// "paciente.nomeCompleto", o erro aparece na hora de programar, e não na
// apresentação para o professor.

export type NomeDePerfil = 'Administrador' | 'Psicologo' | 'Atendente'

export type SituacaoUsuario = 'Ativo' | 'Inativo' | 'Bloqueado'
export type SituacaoCliente = 'Ativo' | 'Inativo'

export type StatusAtendimento =
  | 'Agendado'
  | 'Confirmado'
  | 'Realizado'
  | 'Cancelado'
  | 'Falta'

export type Modalidade = 'Presencial' | 'Online'

export interface Perfil {
  idPerfil: number
  nome: NomeDePerfil
  descricao: string
}

export interface Usuario {
  idUsuario: number
  nomeCompleto: string
  email: string
  perfil: Perfil
  situacao: SituacaoUsuario
  dataCadastro: string
  ultimoAcesso: string | null
}

export interface Psicologo {
  idPsicologo: number
  usuario: Usuario
  crp: string
  areaAtuacao: string
  abordagem: string | null
  telefone: string | null
}

export interface ClientePaciente {
  idCliente: number
  nomeCompleto: string
  dataNascimento: string | null
  email: string | null
  telefone: string
  cidade: string | null
  estado: string | null
  situacao: SituacaoCliente
  observacoesAdministrativas: string | null
  dataCadastro: string
}

export interface Vinculo {
  idVinculo: number
  psicologo: Psicologo
  cliente: ClientePaciente
  dataInicio: string
  dataFim: string | null
  ativo: boolean
}

export interface Atendimento {
  idAtendimento: number
  psicologo: Psicologo
  cliente: ClientePaciente
  dataHora: string
  duracaoMinutos: number
  modalidade: Modalidade
  status: StatusAtendimento
  confirmadoEm: string | null
  observacoes: string | null
}

export interface LogAcao {
  idLog: number
  usuario: Usuario | null
  acao: string
  entidade: string
  idEntidade: number | null
  detalhes: string | null
  dataHora: string
}

/** Quem está logado (guardado pelo contexto de autenticação). */
export interface UsuarioLogado {
  idUsuario: number
  nomeCompleto: string
  email: string
  perfil: NomeDePerfil
}

/** Indicadores da agenda mostrados nos painéis. */
export interface IndicadoresDaAgenda {
  total: number
  agendados: number
  confirmados: number
  realizados: number
  cancelados: number
  faltas: number
  taxaConfirmacao: number
  taxaFalta: number
  proximos: Atendimento[]
}

export interface Painel {
  perfil: NomeDePerfil
  usuarios?: { Ativo: number; Inativo: number; Bloqueado: number; total: number }
  psicologos?: { total: number }
  clientes: { total: number; ativos: number; inativos: number }
  agenda: IndicadoresDaAgenda
}
