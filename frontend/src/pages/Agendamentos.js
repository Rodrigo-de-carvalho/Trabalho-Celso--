// Agendamentos.js — Formulário com dropdowns (paciente, dentista, procedimento),
// data/hora e status. Também permite MUDAR o estado de um agendamento direto na lista.
import { useState, useEffect } from 'react'
import {
  listarAgendamentos,
  criarAgendamento,
  atualizarAgendamento,
  listarPacientes,
  listarDentistas,
  listarProcedimentos,
} from '../api'

// Os estados possíveis de um atendimento. Deixamos numa constante só para não
// repetir a lista nos dois lugares onde ela aparece (no formulário e na tabela).
const STATUS_OPCOES = [
  'Agendado',
  'Cancelado',
  'Remarcado',
  'Paciente Faltou',
  'Atendimento Concluído',
]

function Agendamentos() {
  // Lista de agendamentos já criados.
  const [lista, setLista] = useState([])
  // Listas que alimentam os três dropdowns.
  const [pacientes, setPacientes] = useState([])
  const [dentistas, setDentistas] = useState([])
  const [procedimentos, setProcedimentos] = useState([])

  const [form, setForm] = useState({
    idPaciente: '',
    idDentista: '',
    idProcedimento: '',
    dataHora: '',
    status: 'Agendado',
    observacoes: '',
  })

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  // Quando a tela abre, carregamos tudo que precisamos.
  useEffect(() => {
    carregarAgendamentos()
    carregarListas()
  }, [])

  async function carregarAgendamentos() {
    try {
      setLista(await listarAgendamentos())
    } catch (e) {
      setErro(e.message)
    }
  }

  // Carrega as três listas dos dropdowns de uma vez.
  async function carregarListas() {
    try {
      setPacientes(await listarPacientes())
      setDentistas(await listarDentistas())
      setProcedimentos(await listarProcedimentos())
    } catch (e) {
      setErro(e.message)
    }
  }

  function atualizarCampo(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')

    // O backend espera os relacionamentos como objetos com o id dentro.
    const agendamento = {
      paciente: { idPaciente: Number(form.idPaciente) },
      dentista: { idDentista: Number(form.idDentista) },
      procedimento: { idProcedimento: Number(form.idProcedimento) },
      dataHora: form.dataHora, // o input datetime-local já manda no formato certo
      status: form.status,
      observacoes: form.observacoes || null,
    }

    try {
      await criarAgendamento(agendamento)
      setSucesso('Agendamento criado com sucesso!')
      setForm({ idPaciente: '', idDentista: '', idProcedimento: '', dataHora: '', status: 'Agendado', observacoes: '' })
      carregarAgendamentos()
    } catch (e) {
      // Ex: "Este dentista já possui um agendamento nesta data e horário."
      setErro(e.message)
    }
  }

  // Muda o ESTADO de um agendamento já existente (ex: para "Cancelado" ou
  // "Atendimento Concluído"). É chamada quando o usuário troca o status na tabela.
  async function mudarStatus(agendamento, novoStatus) {
    setErro('')
    setSucesso('')

    // Para atualizar, o backend precisa do agendamento completo. Remontamos ele
    // com os mesmos ids de antes, mudando apenas o status.
    const dadosAtualizados = {
      paciente: { idPaciente: agendamento.paciente.idPaciente },
      dentista: { idDentista: agendamento.dentista.idDentista },
      procedimento: { idProcedimento: agendamento.procedimento.idProcedimento },
      dataHora: agendamento.dataHora,
      status: novoStatus,
      observacoes: agendamento.observacoes || null,
    }

    try {
      await atualizarAgendamento(agendamento.idAgendamento, dadosAtualizados)
      setSucesso(
        'Status do agendamento #' + agendamento.idAgendamento + ' alterado para "' + novoStatus + '".'
      )
      carregarAgendamentos()
    } catch (e) {
      setErro(e.message)
    }
  }

  return (
    <div>
      <div className="card">
        <h1>Agendamentos</h1>
        <p className="subtitulo">Marque um horário escolhendo paciente, dentista e procedimento.</p>

        {erro && <div className="mensagem-erro">{erro}</div>}
        {sucesso && <div className="mensagem-sucesso">{sucesso}</div>}

        <form onSubmit={enviar}>
          <div className="grade">
            {/* Dropdown de pacientes carregado da API. */}
            <div className="campo">
              <label>Paciente *</label>
              <select name="idPaciente" value={form.idPaciente} onChange={atualizarCampo} required>
                <option value="">Selecione...</option>
                {pacientes.map((p) => (
                  <option key={p.idPaciente} value={p.idPaciente}>
                    {p.nomeCompleto}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown de dentistas. */}
            <div className="campo">
              <label>Dentista *</label>
              <select name="idDentista" value={form.idDentista} onChange={atualizarCampo} required>
                <option value="">Selecione...</option>
                {dentistas.map((d) => (
                  <option key={d.idDentista} value={d.idDentista}>
                    {d.nomeCompleto}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown de procedimentos. */}
            <div className="campo">
              <label>Procedimento *</label>
              <select name="idProcedimento" value={form.idProcedimento} onChange={atualizarCampo} required>
                <option value="">Selecione...</option>
                {procedimentos.map((p) => (
                  <option key={p.idProcedimento} value={p.idProcedimento}>
                    {p.nome} — R$ {p.valor}
                  </option>
                ))}
              </select>
            </div>

            {/* Data e hora do agendamento. */}
            <div className="campo">
              <label>Data e hora *</label>
              <input name="dataHora" type="datetime-local" value={form.dataHora} onChange={atualizarCampo} required />
            </div>

            {/* Status do agendamento (usa a lista de opções definida no topo). */}
            <div className="campo">
              <label>Status</label>
              <select name="status" value={form.status} onChange={atualizarCampo}>
                {STATUS_OPCOES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="campo">
            <label>Observações</label>
            <textarea name="observacoes" value={form.observacoes} onChange={atualizarCampo} rows="2" />
          </div>

          <button type="submit">Criar agendamento</button>
        </form>
      </div>

      <div className="card">
        <h2>Agendamentos ({lista.length})</h2>
        <p className="subtitulo">
          Para mudar o estado de um atendimento, é só trocar o status na coluna "Status".
        </p>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Paciente</th>
              <th>Dentista</th>
              <th>Procedimento</th>
              <th>Data/Hora</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((a) => (
              <tr key={a.idAgendamento}>
                <td>{a.idAgendamento}</td>
                {/* Usamos o "?." para evitar erro caso algum dado venha nulo. */}
                <td>{a.paciente?.nomeCompleto}</td>
                <td>{a.dentista?.nomeCompleto}</td>
                <td>{a.procedimento?.nome}</td>
                <td>{a.dataHora}</td>
                <td>
                  {/* Dropdown editável: ao trocar, chamamos mudarStatus para salvar no banco. */}
                  <select value={a.status} onChange={(e) => mudarStatus(a, e.target.value)}>
                    {STATUS_OPCOES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Agendamentos
