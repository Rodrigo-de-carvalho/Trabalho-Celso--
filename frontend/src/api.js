// ============================================================
//  api.js — Arquivo centralizado de comunicação com o backend
// ============================================================
// Aqui ficam TODAS as funções que chamam a API (o backend Spring Boot).
// Centralizar isso num arquivo só deixa o resto do código mais limpo: as telas
// só importam a função pronta (ex: criarPaciente) e não precisam saber a URL.

// Endereço base da API. Todas as rotas começam a partir daqui.
const URL_BASE = 'http://localhost:8080/api'

// ------------------------------------------------------------
// Função auxiliar genérica que faz a requisição e trata erros.
// Todas as outras funções abaixo usam esta aqui por baixo.
// ------------------------------------------------------------
async function requisicao(caminho, opcoes) {
  // Faz a chamada HTTP de fato (fetch é a função nativa do navegador).
  const resposta = await fetch(URL_BASE + caminho, opcoes)

  // Status 204 = "No Content": deu certo mas não há corpo para ler (ex: DELETE).
  if (resposta.status === 204) {
    return null
  }

  // Lê o corpo da resposta convertendo de JSON para objeto JavaScript.
  const dados = await resposta.json()

  // resposta.ok é true para status 200-299 (sucesso). Se NÃO for sucesso,
  // o backend mandou um JSON com a chave "mensagem" explicando o erro.
  // Lançamos esse erro para a tela poder mostrar a mensagem ao usuário.
  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao comunicar com o servidor.')
  }

  return dados
}

// Atalhos para os 4 métodos HTTP, para não repetir código nas funções abaixo.
function get(caminho) {
  return requisicao(caminho, { method: 'GET' })
}

function post(caminho, corpo) {
  return requisicao(caminho, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // avisamos que enviamos JSON
    body: JSON.stringify(corpo), // transforma o objeto JS em texto JSON
  })
}

function put(caminho, corpo) {
  return requisicao(caminho, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  })
}

function deletar(caminho) {
  return requisicao(caminho, { method: 'DELETE' })
}

// ============================================================
//  Funções por recurso (uma para cada endpoint do backend)
// ============================================================

// ----- PLANOS ODONTOLÓGICOS -----
export function listarPlanos() {
  return get('/planos')
}
export function criarPlano(plano) {
  return post('/planos', plano)
}

// ----- PACIENTES -----
export function listarPacientes() {
  return get('/pacientes')
}
// Busca por nome OU CPF. encodeURIComponent protege caracteres especiais na URL.
export function buscarPacientes(termo) {
  return get('/pacientes/buscar?termo=' + encodeURIComponent(termo))
}
export function criarPaciente(paciente) {
  return post('/pacientes', paciente)
}
export function atualizarPaciente(id, paciente) {
  return put('/pacientes/' + id, paciente)
}
export function deletarPaciente(id) {
  return deletar('/pacientes/' + id)
}

// ----- DENTISTAS -----
export function listarDentistas() {
  return get('/dentistas')
}
export function criarDentista(dentista) {
  return post('/dentistas', dentista)
}

// ----- PROCEDIMENTOS -----
export function listarProcedimentos() {
  return get('/procedimentos')
}
export function criarProcedimento(procedimento) {
  return post('/procedimentos', procedimento)
}

// ----- AGENDAMENTOS -----
export function listarAgendamentos() {
  return get('/agendamentos')
}
export function criarAgendamento(agendamento) {
  return post('/agendamentos', agendamento)
}
// Atualiza um agendamento existente (usada para mudar o status do atendimento).
export function atualizarAgendamento(id, agendamento) {
  return put('/agendamentos/' + id, agendamento)
}

// ----- CONSULTAS -----
export function listarConsultas() {
  return get('/consultas')
}
export function criarConsulta(consulta) {
  return post('/consultas', consulta)
}

// ----- PAGAMENTOS -----
export function listarPagamentos() {
  return get('/pagamentos')
}
export function criarPagamento(pagamento) {
  return post('/pagamentos', pagamento)
}

// ----- HISTÓRICOS CLÍNICOS -----
export function listarHistoricos() {
  return get('/historicos')
}
export function listarHistoricosPorPaciente(idPaciente) {
  return get('/historicos/paciente/' + idPaciente)
}
export function criarHistorico(historico) {
  return post('/historicos', historico)
}
