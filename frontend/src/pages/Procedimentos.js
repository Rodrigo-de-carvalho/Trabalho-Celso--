// Procedimentos.js — Tela para cadastrar e listar procedimentos (serviços e valores).
import { useState, useEffect } from 'react'
import { listarProcedimentos, criarProcedimento } from '../api'

function Procedimentos() {
  const [lista, setLista] = useState([])
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    valor: '',
    tempoEstimado: '',
  })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    try {
      setLista(await listarProcedimentos())
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

    // Convertemos valor e tempo para número (no input vêm como texto).
    const procedimento = {
      nome: form.nome,
      descricao: form.descricao || null,
      valor: form.valor ? Number(form.valor) : 0,
      tempoEstimado: form.tempoEstimado ? Number(form.tempoEstimado) : null,
    }

    try {
      await criarProcedimento(procedimento)
      setSucesso('Procedimento cadastrado com sucesso!')
      setForm({ nome: '', descricao: '', valor: '', tempoEstimado: '' })
      carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  return (
    <div>
      <div className="card">
        <h1>Procedimentos</h1>
        <p className="subtitulo">Cadastre os serviços oferecidos e seus valores.</p>

        {erro && <div className="mensagem-erro">{erro}</div>}
        {sucesso && <div className="mensagem-sucesso">{sucesso}</div>}

        <form onSubmit={enviar}>
          <div className="campo">
            <label>Nome *</label>
            <input name="nome" value={form.nome} onChange={atualizarCampo} required />
          </div>
          <div className="campo">
            <label>Descrição</label>
            <textarea name="descricao" value={form.descricao} onChange={atualizarCampo} rows="2" />
          </div>
          <div className="grade">
            <div className="campo">
              <label>Valor (R$) *</label>
              <input name="valor" type="number" step="0.01" value={form.valor} onChange={atualizarCampo} required />
            </div>
            <div className="campo">
              <label>Tempo estimado (min)</label>
              <input name="tempoEstimado" type="number" value={form.tempoEstimado} onChange={atualizarCampo} />
            </div>
          </div>
          <button type="submit">Cadastrar procedimento</button>
        </form>
      </div>

      <div className="card">
        <h2>Procedimentos cadastrados ({lista.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Valor</th>
              <th>Tempo (min)</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.idProcedimento}>
                <td>{p.idProcedimento}</td>
                <td>{p.nome}</td>
                <td>R$ {p.valor}</td>
                <td>{p.tempoEstimado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Procedimentos
