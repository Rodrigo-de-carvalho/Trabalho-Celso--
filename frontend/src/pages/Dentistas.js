// Dentistas.js — Tela para cadastrar e listar dentistas.
import { useState, useEffect } from 'react'
import { listarDentistas, criarDentista } from '../api'

function Dentistas() {
  const [lista, setLista] = useState([])
  const [form, setForm] = useState({
    nomeCompleto: '',
    cro: '',
    especialidade: '',
    telefone: '',
    email: '',
  })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  // Carrega a lista assim que a tela abre.
  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    try {
      setLista(await listarDentistas())
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
    try {
      await criarDentista(form)
      setSucesso('Dentista cadastrado com sucesso!')
      setForm({ nomeCompleto: '', cro: '', especialidade: '', telefone: '', email: '' })
      carregar()
    } catch (e) {
      // Ex: "Já existe um dentista cadastrado com este CRO."
      setErro(e.message)
    }
  }

  return (
    <div>
      <div className="card">
        <h1>Dentistas</h1>
        <p className="subtitulo">Cadastre os dentistas da clínica (CRO e e-mail são únicos).</p>

        {erro && <div className="mensagem-erro">{erro}</div>}
        {sucesso && <div className="mensagem-sucesso">{sucesso}</div>}

        <form onSubmit={enviar}>
          <div className="campo">
            <label>Nome completo *</label>
            <input name="nomeCompleto" value={form.nomeCompleto} onChange={atualizarCampo} required />
          </div>
          <div className="grade">
            <div className="campo">
              <label>CRO *</label>
              <input name="cro" value={form.cro} onChange={atualizarCampo} required />
            </div>
            <div className="campo">
              <label>Especialidade</label>
              <input name="especialidade" value={form.especialidade} onChange={atualizarCampo} />
            </div>
            <div className="campo">
              <label>Telefone *</label>
              <input name="telefone" value={form.telefone} onChange={atualizarCampo} required />
            </div>
            <div className="campo">
              <label>E-mail *</label>
              <input name="email" type="email" value={form.email} onChange={atualizarCampo} required />
            </div>
          </div>
          <button type="submit">Cadastrar dentista</button>
        </form>
      </div>

      <div className="card">
        <h2>Dentistas cadastrados ({lista.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>CRO</th>
              <th>Especialidade</th>
              <th>E-mail</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((d) => (
              <tr key={d.idDentista}>
                <td>{d.idDentista}</td>
                <td>{d.nomeCompleto}</td>
                <td>{d.cro}</td>
                <td>{d.especialidade}</td>
                <td>{d.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dentistas
