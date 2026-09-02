// HistoricoClinico.js — Registra e lista o histórico de saúde de um paciente.
// É sempre VINCULADO a um paciente (escolhido no dropdown).
import { useState, useEffect } from 'react'
import { listarPacientes, criarHistorico, listarHistoricosPorPaciente } from '../api'

function HistoricoClinico() {
  // Lista de pacientes para o dropdown.
  const [pacientes, setPacientes] = useState([])
  // Históricos do paciente selecionado.
  const [historicos, setHistoricos] = useState([])

  const [form, setForm] = useState({
    idPaciente: '',
    alergias: '',
    doencasSistemicas: '',
    medicamentosContinuos: '',
    observacoes: '',
  })

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  // Carrega a lista de pacientes ao abrir a tela.
  useEffect(() => {
    carregarPacientes()
  }, [])

  async function carregarPacientes() {
    try {
      setPacientes(await listarPacientes())
    } catch (e) {
      setErro(e.message)
    }
  }

  function atualizarCampo(e) {
    setForm({ ...form, [e.target.name]: e.target.value })

    // Se o usuário trocou o paciente, já carregamos o histórico dele.
    if (e.target.name === 'idPaciente' && e.target.value) {
      carregarHistoricos(e.target.value)
    }
  }

  // Busca os históricos de um paciente específico.
  async function carregarHistoricos(idPaciente) {
    try {
      setHistoricos(await listarHistoricosPorPaciente(idPaciente))
    } catch (e) {
      setErro(e.message)
    }
  }

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')

    const historico = {
      paciente: { idPaciente: Number(form.idPaciente) },
      alergias: form.alergias || null,
      doencasSistemicas: form.doencasSistemicas || null,
      medicamentosContinuos: form.medicamentosContinuos || null,
      observacoes: form.observacoes || null,
    }

    try {
      await criarHistorico(historico)
      setSucesso('Histórico clínico registrado com sucesso!')
      // Recarrega os históricos do mesmo paciente para o novo aparecer.
      carregarHistoricos(form.idPaciente)
      // Limpa só os campos de texto, mantendo o paciente selecionado.
      setForm({ ...form, alergias: '', doencasSistemicas: '', medicamentosContinuos: '', observacoes: '' })
    } catch (e) {
      setErro(e.message)
    }
  }

  return (
    <div>
      <div className="card">
        <h1>Histórico Clínico</h1>
        <p className="subtitulo">Registre informações de saúde de um paciente.</p>

        {erro && <div className="mensagem-erro">{erro}</div>}
        {sucesso && <div className="mensagem-sucesso">{sucesso}</div>}

        <form onSubmit={enviar}>
          <div className="campo">
            <label>Paciente *</label>
            <select name="idPaciente" value={form.idPaciente} onChange={atualizarCampo} required>
              <option value="">Selecione um paciente...</option>
              {pacientes.map((p) => (
                <option key={p.idPaciente} value={p.idPaciente}>
                  {p.nomeCompleto}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label>Alergias</label>
            <textarea name="alergias" value={form.alergias} onChange={atualizarCampo} rows="2" />
          </div>
          <div className="campo">
            <label>Doenças sistêmicas</label>
            <textarea name="doencasSistemicas" value={form.doencasSistemicas} onChange={atualizarCampo} rows="2" />
          </div>
          <div className="campo">
            <label>Medicamentos de uso contínuo</label>
            <textarea name="medicamentosContinuos" value={form.medicamentosContinuos} onChange={atualizarCampo} rows="2" />
          </div>
          <div className="campo">
            <label>Observações</label>
            <textarea name="observacoes" value={form.observacoes} onChange={atualizarCampo} rows="2" />
          </div>
          <button type="submit">Registrar histórico</button>
        </form>
      </div>

      <div className="card">
        <h2>Históricos do paciente selecionado ({historicos.length})</h2>
        {/* Se nenhum paciente foi escolhido ainda, avisamos. */}
        {form.idPaciente === '' ? (
          <p>Selecione um paciente acima para ver o histórico.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Alergias</th>
                <th>Doenças</th>
                <th>Medicamentos</th>
              </tr>
            </thead>
            <tbody>
              {historicos.map((h) => (
                <tr key={h.idHistorico}>
                  <td>{h.idHistorico}</td>
                  <td>{h.alergias}</td>
                  <td>{h.doencasSistemicas}</td>
                  <td>{h.medicamentosContinuos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default HistoricoClinico
