// Consultas.js — Registra uma consulta a partir de um agendamento.
// O valor total é CALCULADO pelo backend (valor do procedimento - desconto do plano).
import { useState, useEffect } from 'react'
import { listarConsultas, criarConsulta, listarAgendamentos } from '../api'

function Consultas() {
  const [lista, setLista] = useState([])
  // Lista de agendamentos para o dropdown (de qual agendamento veio a consulta).
  const [agendamentos, setAgendamentos] = useState([])

  const [form, setForm] = useState({
    idAgendamento: '',
    dataHoraRealizacao: '',
    observacoes: '',
  })

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    carregarConsultas()
    carregarAgendamentos()
  }, [])

  async function carregarConsultas() {
    try {
      setLista(await listarConsultas())
    } catch (e) {
      setErro(e.message)
    }
  }

  async function carregarAgendamentos() {
    try {
      setAgendamentos(await listarAgendamentos())
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

    // Enviamos só o agendamento e os dados da realização.
    // O paciente, dentista, procedimento e o valor total o backend resolve sozinho.
    const consulta = {
      agendamento: { idAgendamento: Number(form.idAgendamento) },
      dataHoraRealizacao: form.dataHoraRealizacao || null,
      observacoes: form.observacoes || null,
    }

    try {
      const criada = await criarConsulta(consulta)
      // Mostramos o valor calculado para o usuário ver o desconto funcionando.
      setSucesso('Consulta registrada! Valor total calculado: R$ ' + criada.valorTotal)
      setForm({ idAgendamento: '', dataHoraRealizacao: '', observacoes: '' })
      carregarConsultas()
    } catch (e) {
      setErro(e.message)
    }
  }

  return (
    <div>
      <div className="card">
        <h1>Consultas</h1>
        <p className="subtitulo">
          Registre o atendimento realizado. O valor é calculado automaticamente
          com o desconto do plano do paciente.
        </p>

        {erro && <div className="mensagem-erro">{erro}</div>}
        {sucesso && <div className="mensagem-sucesso">{sucesso}</div>}

        <form onSubmit={enviar}>
          <div className="campo">
            <label>Agendamento *</label>
            <select name="idAgendamento" value={form.idAgendamento} onChange={atualizarCampo} required>
              <option value="">Selecione um agendamento...</option>
              {agendamentos.map((a) => (
                <option key={a.idAgendamento} value={a.idAgendamento}>
                  #{a.idAgendamento} — {a.paciente?.nomeCompleto} / {a.procedimento?.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label>Data e hora da realização</label>
            <input
              name="dataHoraRealizacao"
              type="datetime-local"
              value={form.dataHoraRealizacao}
              onChange={atualizarCampo}
            />
          </div>
          <div className="campo">
            <label>Observações</label>
            <textarea name="observacoes" value={form.observacoes} onChange={atualizarCampo} rows="2" />
          </div>
          <button type="submit">Registrar consulta</button>
        </form>
      </div>

      <div className="card">
        <h2>Consultas realizadas ({lista.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Paciente</th>
              <th>Procedimento</th>
              <th>Data realização</th>
              <th>Valor total</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((c) => (
              <tr key={c.idConsulta}>
                <td>{c.idConsulta}</td>
                <td>{c.paciente?.nomeCompleto}</td>
                <td>{c.procedimento?.nome}</td>
                <td>{c.dataHoraRealizacao}</td>
                <td>R$ {c.valorTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Consultas
