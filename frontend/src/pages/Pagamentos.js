// Pagamentos.js — Registra e lista pagamentos. Cada pagamento é VINCULADO a uma consulta.
import { useState, useEffect } from 'react'
import { listarPagamentos, criarPagamento, listarConsultas } from '../api'

function Pagamentos() {
  const [lista, setLista] = useState([])
  // Lista de consultas para o dropdown (qual consulta está sendo paga).
  const [consultas, setConsultas] = useState([])

  const [form, setForm] = useState({
    idConsulta: '',
    formaPagamento: 'Dinheiro',
    valorPago: '',
    parcelas: '1',
    descricao: '',
  })

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    carregarPagamentos()
    carregarConsultas()
  }, [])

  async function carregarPagamentos() {
    try {
      setLista(await listarPagamentos())
    } catch (e) {
      setErro(e.message)
    }
  }

  async function carregarConsultas() {
    try {
      setConsultas(await listarConsultas())
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

    const pagamento = {
      consulta: { idConsulta: Number(form.idConsulta) },
      formaPagamento: form.formaPagamento,
      valorPago: form.valorPago ? Number(form.valorPago) : 0,
      parcelas: form.parcelas ? Number(form.parcelas) : 1,
      descricao: form.descricao || null,
    }

    try {
      await criarPagamento(pagamento)
      setSucesso('Pagamento registrado com sucesso!')
      setForm({ idConsulta: '', formaPagamento: 'Dinheiro', valorPago: '', parcelas: '1', descricao: '' })
      carregarPagamentos()
    } catch (e) {
      // Ex: "O valor pago deve ser maior que zero."
      setErro(e.message)
    }
  }

  return (
    <div>
      <div className="card">
        <h1>Pagamentos</h1>
        <p className="subtitulo">Registre o pagamento de uma consulta realizada.</p>

        {erro && <div className="mensagem-erro">{erro}</div>}
        {sucesso && <div className="mensagem-sucesso">{sucesso}</div>}

        <form onSubmit={enviar}>
          <div className="campo">
            <label>Consulta *</label>
            <select name="idConsulta" value={form.idConsulta} onChange={atualizarCampo} required>
              <option value="">Selecione uma consulta...</option>
              {consultas.map((c) => (
                <option key={c.idConsulta} value={c.idConsulta}>
                  #{c.idConsulta} — {c.paciente?.nomeCompleto} — R$ {c.valorTotal}
                </option>
              ))}
            </select>
          </div>
          <div className="grade">
            <div className="campo">
              <label>Forma de pagamento *</label>
              <select name="formaPagamento" value={form.formaPagamento} onChange={atualizarCampo}>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão Débito">Cartão Débito</option>
                <option value="Cartão Crédito">Cartão Crédito</option>
                <option value="Pix">Pix</option>
                <option value="Boleto">Boleto</option>
              </select>
            </div>
            <div className="campo">
              <label>Valor pago (R$) *</label>
              <input name="valorPago" type="number" step="0.01" value={form.valorPago} onChange={atualizarCampo} required />
            </div>
            <div className="campo">
              <label>Parcelas</label>
              <input name="parcelas" type="number" min="1" value={form.parcelas} onChange={atualizarCampo} />
            </div>
            <div className="campo">
              <label>Descrição</label>
              <input name="descricao" value={form.descricao} onChange={atualizarCampo} />
            </div>
          </div>
          <button type="submit">Registrar pagamento</button>
        </form>
      </div>

      <div className="card">
        <h2>Pagamentos registrados ({lista.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Consulta</th>
              <th>Forma</th>
              <th>Valor</th>
              <th>Parcelas</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.idPagamento}>
                <td>{p.idPagamento}</td>
                <td>#{p.consulta?.idConsulta}</td>
                <td>{p.formaPagamento}</td>
                <td>R$ {p.valorPago}</td>
                <td>{p.parcelas}x</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Pagamentos
