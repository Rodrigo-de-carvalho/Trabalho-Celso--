// ============================================================
//  api.ts — Arquivo centralizado de comunicação com o backend
// ============================================================
// Aqui ficam TODAS as funções que chamam a API. Centralizar isso num arquivo
// só deixa o resto do código mais limpo: as telas só importam a função pronta
// (ex: criarPaciente) e não precisam saber a URL nem o token.

import {
  Atendimento,
  ClientePaciente,
  LogAcao,
  Painel,
  Perfil,
  Psicologo,
  Usuario,
  UsuarioLogado,
  Vinculo,
} from './tipos'

// Endereço base da API. Todas as rotas começam a partir daqui.
const URL_BASE = 'http://localhost:8080/api'

// Nome da chave usada no navegador para guardar o token de login.
const CHAVE_DO_TOKEN = 'psigestor.token'

// ------------------------------------------------------------
//  Token de acesso
// ------------------------------------------------------------
// O token fica no localStorage para o usuário não precisar logar de novo a
// cada F5. Ele é enviado em TODA requisição, no cabeçalho Authorization.

export function guardarToken(token: string) {
  localStorage.setItem(CHAVE_DO_TOKEN, token)
}

export function lerToken(): string | null {
  return localStorage.getItem(CHAVE_DO_TOKEN)
}

export function apagarToken() {
  localStorage.removeItem(CHAVE_DO_TOKEN)
}

/**
 * Erro vindo da API, já com o status HTTP junto.
 *
 * Guardar o status permite a tela reagir de forma diferente para cada caso —
 * por exemplo, mandar o usuário de volta ao login quando recebe 401.
 */
export class ErroDaApi extends Error {
  readonly status: number

  constructor(mensagem: string, status: number) {
    super(mensagem)
    this.status = status
  }
}

// ------------------------------------------------------------
// Função auxiliar genérica que faz a requisição e trata erros.
// Todas as outras funções abaixo usam esta aqui por baixo.
// ------------------------------------------------------------
async function requisicao<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const token = lerToken()

  const cabecalhos: Record<string, string> = {
    ...(opcoes.headers as Record<string, string>),
  }
  if (opcoes.body) {
    cabecalhos['Content-Type'] = 'application/json'
  }
  if (token) {
    cabecalhos['Authorization'] = 'Bearer ' + token
  }

  const resposta = await fetch(URL_BASE + caminho, { ...opcoes, headers: cabecalhos })

  // 204 = "No Content": deu certo, mas não há corpo para ler.
  if (resposta.status === 204) {
    return null as T
  }

  const dados = await resposta.json().catch(() => ({}))

  if (!resposta.ok) {
    // Sessão expirada ou token inválido: apagamos o token guardado para o app
    // voltar naturalmente à tela de login.
    if (resposta.status === 401) {
      apagarToken()
    }
    const mensagem =
      (dados as { mensagem?: string }).mensagem ?? 'Erro ao comunicar com o servidor.'
    throw new ErroDaApi(mensagem, resposta.status)
  }

  return dados as T
}

function get<T>(caminho: string) {
  return requisicao<T>(caminho, { method: 'GET' })
}

function post<T>(caminho: string, corpo?: unknown) {
  return requisicao<T>(caminho, {
    method: 'POST',
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  })
}

function patch<T>(caminho: string, corpo: unknown) {
  return requisicao<T>(caminho, { method: 'PATCH', body: JSON.stringify(corpo) })
}

// ============================================================
//  AUTENTICAÇÃO
// ============================================================

export function entrar(email: string, senha: string) {
  return post<{ token: string; usuario: UsuarioLogado }>('/auth/login', { email, senha })
}

export function sair() {
  return post<{ mensagem: string }>('/auth/logout')
}

/** Confere se o token guardado ainda vale (usada ao recarregar a página). */
export function conferirSessao() {
  return get<{ idUsuario: number; email: string; perfil: UsuarioLogado['perfil'] }>('/auth/eu')
}

// ============================================================
//  PAINEL (indicadores)
// ============================================================

export function carregarPainel() {
  return get<Painel>('/dashboard')
}

// ============================================================
//  USUÁRIOS (administrador)
// ============================================================

export function listarUsuarios(filtros: { situacao?: string; termo?: string } = {}) {
  const parametros = new URLSearchParams()
  if (filtros.situacao) parametros.set('situacao', filtros.situacao)
  if (filtros.termo) parametros.set('termo', filtros.termo)
  const query = parametros.toString()
  return get<Usuario[]>('/users' + (query ? '?' + query : ''))
}

export function listarPerfis() {
  return get<Perfil[]>('/users/perfis')
}

export function criarUsuario(dados: {
  nomeCompleto: string
  email: string
  senha: string
  perfil: { idPerfil: number }
}) {
  return post<Usuario>('/users', dados)
}

/** Atualiza parcialmente um usuário (nome, e-mail, perfil, situação ou senha). */
export function atualizarUsuario(id: number, dados: Record<string, unknown>) {
  return patch<Usuario>('/users/' + id, dados)
}

// ============================================================
//  PSICÓLOGOS
// ============================================================

export function listarPsicologos() {
  return get<Psicologo[]>('/psychologists')
}

export function meuCadastroDePsicologo() {
  return get<Psicologo>('/psychologists/eu')
}

export function criarPsicologo(dados: {
  usuario: { idUsuario: number }
  crp: string
  areaAtuacao: string
  abordagem?: string | null
  telefone?: string | null
}) {
  return post<Psicologo>('/psychologists', dados)
}

export function atualizarPsicologo(id: number, dados: Record<string, unknown>) {
  return patch<Psicologo>('/psychologists/' + id, dados)
}

// ============================================================
//  CLIENTES / PACIENTES
// ============================================================

export function listarPacientes(filtros: { termo?: string; situacao?: string } = {}) {
  const parametros = new URLSearchParams()
  if (filtros.termo) parametros.set('termo', filtros.termo)
  if (filtros.situacao) parametros.set('situacao', filtros.situacao)
  const query = parametros.toString()
  return get<ClientePaciente[]>('/patients' + (query ? '?' + query : ''))
}

export function criarPaciente(dados: Record<string, unknown>) {
  return post<ClientePaciente>('/patients', dados)
}

export function atualizarPaciente(id: number, dados: Record<string, unknown>) {
  return patch<ClientePaciente>('/patients/' + id, dados)
}

export function listarVinculosDoPsicologo(idPsicologo: number) {
  return get<Vinculo[]>('/patients/vinculos/psicologo/' + idPsicologo)
}

export function vincularPaciente(idPsicologo: number, idCliente: number) {
  return post<Vinculo>('/patients/vinculos', {
    psicologo: { idPsicologo },
    cliente: { idCliente },
  })
}

export function encerrarVinculo(idVinculo: number) {
  return patch<Vinculo>('/patients/vinculos/' + idVinculo + '/encerrar', {})
}

// ============================================================
//  ATENDIMENTOS — agenda com confirmação (funcionalidade inovadora)
// ============================================================

export function listarAtendimentos() {
  return get<Atendimento[]>('/appointments')
}

export function criarAtendimento(dados: Record<string, unknown>) {
  return post<Atendimento>('/appointments', dados)
}

/** Confirma a presença no atendimento. */
export function confirmarAtendimento(id: number) {
  return patch<Atendimento>('/appointments/' + id + '/confirmar', {})
}

export function atualizarAtendimento(id: number, dados: Record<string, unknown>) {
  return patch<Atendimento>('/appointments/' + id, dados)
}

// ============================================================
//  AUDITORIA (administrador)
// ============================================================

export function listarLogs(limite = 200) {
  return get<LogAcao[]>('/audit-logs?limite=' + limite)
}
