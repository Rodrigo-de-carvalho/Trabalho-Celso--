// Planos.js — Tela para cadastrar e listar planos odontológicos.
// (O plano define o desconto que será aplicado no valor das consultas.)
import { useState, useEffect } from 'react'
import { listarPlanos, criarPlano } from '../api'

function Planos() {
  // "lista" guarda os planos que vieram do backend para mostrar na tabela.
  const [lista, setLista] = useState([])

  // "form" guarda o que o usuário está digitando no formulário.
  // Usamos um objeto só para todos os campos (mais simples que vários useState).
  const [form, setForm] = useState({
    nomePlano: '',
    operadora: '',
    descontoPercentual: '',
    cobertura: '',
  })

  // Mensagens para mostrar ao usuário (erro em vermelho, sucesso em verde).
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  // useEffect com [] roda UMA vez, quando a tela abre. Aqui carregamos a lista.
  useEffect(() => {
    carregarPlanos()
  }, [])

  // Busca os planos no backend e guarda no estado "lista".
  async function carregarPlanos() {
    try {
      const dados = await listarPlanos()
      setLista(dados)
    } catch (e) {
      setErro(e.message)
    }
  }

  // Atualiza o campo do formulário conforme o usuário digita.
  // [e.target.name] usa o "name" do input para saber qual campo mudar.
  function atualizarCampo(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Envia o formulário para cadastrar um novo plano.
  async function enviar(e) {
    e.preventDefault() // impede a página de recarregar (comportamento padrão do form)
    setErro('')
    setSucesso('')
    try {
      await criarPlano(form)
      setSucesso('Plano cadastrado com sucesso!')
      // Limpa o formulário.
      setForm({ nomePlano: '', operadora: '', descontoPercentual: '', cobertura: '' })
      // Recarrega a lista para o novo plano aparecer.
      carregarPlanos()
    } catch (e) {
      // Se o backend retornar erro, mostramos a mensagem dele aqui.
      setErro(e.message)
    }
  }

  return (
    <div>
      <div className="card">
        <h1>Planos Odontológicos</h1>
        <p className="subtitulo">Cadastre os planos e o desconto que cada um oferece.</p>

        {/* Mostra as mensagens só quando existem. */}
        {erro && <div className="mensagem-erro">{erro}</div>}
        {sucesso && <div className="mensagem-sucesso">{sucesso}</div>}

        <form onSubmit={enviar}>
          <div className="campo">
            <label>Nome do plano *</label>
            <input name="nomePlano" value={form.nomePlano} onChange={atualizarCampo} required />
          </div>
          <div className="grade">
            <div className="campo">
              <label>Operadora</label>
              <input name="operadora" value={form.operadora} onChange={atualizarCampo} />
            </div>
            <div className="campo">
              <label>Desconto (%)</label>
              <input
                name="descontoPercentual"
                type="number"
                step="0.01"
                value={form.descontoPercentual}
                onChange={atualizarCampo}
              />
            </div>
          </div>
          <div className="campo">
            <label>Cobertura</label>
            <textarea name="cobertura" value={form.cobertura} onChange={atualizarCampo} rows="2" />
          </div>
          <button type="submit">Cadastrar plano</button>
        </form>
      </div>

      <div className="card">
        <h2>Planos cadastrados ({lista.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Operadora</th>
              <th>Desconto</th>
            </tr>
          </thead>
          <tbody>
            {/* map() transforma cada plano em uma linha (<tr>) da tabela.
                "key" ajuda o React a identificar cada linha (usamos o id). */}
            {lista.map((plano) => (
              <tr key={plano.idPlano}>
                <td>{plano.idPlano}</td>
                <td>{plano.nomePlano}</td>
                <td>{plano.operadora}</td>
                <td>{plano.descontoPercentual}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Planos
