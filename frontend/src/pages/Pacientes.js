// Pacientes.js — Tela para cadastrar, EDITAR e listar pacientes, com busca por nome/CPF.
import { useState, useEffect } from 'react'
import {
  listarPacientes,
  buscarPacientes,
  criarPaciente,
  atualizarPaciente,
  listarPlanos,
} from '../api'

// Como o formulário começa "vazio". Deixamos numa constante para reaproveitar
// na hora de limpar o formulário depois de salvar ou cancelar.
const FORM_VAZIO = {
  nomeCompleto: '',
  cpf: '',
  dataNascimento: '',
  rg: '',
  sexo: '',
  telefone: '',
  email: '',
  endereco: '',
  cidade: '',
  estado: '',
  cep: '',
  idPlano: '', // guardamos só o id do plano escolhido; convertemos na hora de enviar
  numeroCarteirinha: '',
  dataValidadePlano: '',
}

function Pacientes() {
  // Lista de pacientes mostrada na tabela.
  const [lista, setLista] = useState([])
  // Lista de planos para preencher o dropdown (paciente pode entrar em um plano).
  const [planos, setPlanos] = useState([])
  // Texto digitado na barra de busca.
  const [termoBusca, setTermoBusca] = useState('')

  // Todos os campos do formulário em um objeto só.
  const [form, setForm] = useState(FORM_VAZIO)

  // Guarda o id do paciente que está sendo EDITADO.
  // Se for null, significa que estamos CADASTRANDO um novo.
  const [editandoId, setEditandoId] = useState(null)

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  // Ao abrir a tela, carregamos pacientes e planos.
  useEffect(() => {
    carregarPacientes()
    carregarPlanos()
  }, [])

  async function carregarPacientes() {
    try {
      setLista(await listarPacientes())
    } catch (e) {
      setErro(e.message)
    }
  }

  async function carregarPlanos() {
    try {
      setPlanos(await listarPlanos())
    } catch (e) {
      setErro(e.message)
    }
  }

  function atualizarCampo(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Faz a busca por nome ou CPF. Se o campo estiver vazio, lista todos de novo.
  async function buscar(e) {
    e.preventDefault()
    setErro('')
    try {
      if (termoBusca.trim() === '') {
        carregarPacientes()
      } else {
        setLista(await buscarPacientes(termoBusca))
      }
    } catch (e) {
      setErro(e.message)
    }
  }

  // Coloca os dados de um paciente da lista DENTRO do formulário, para editar.
  function iniciarEdicao(p) {
    setEditandoId(p.idPaciente)
    setForm({
      nomeCompleto: p.nomeCompleto || '',
      cpf: p.cpf || '',
      dataNascimento: p.dataNascimento || '',
      rg: p.rg || '',
      sexo: p.sexo || '',
      telefone: p.telefone || '',
      email: p.email || '',
      endereco: p.endereco || '',
      cidade: p.cidade || '',
      estado: p.estado || '',
      cep: p.cep || '',
      // Se o paciente já tem plano, pré-seleciona ele no dropdown.
      idPlano: p.plano ? String(p.plano.idPlano) : '',
      numeroCarteirinha: p.numeroCarteirinha || '',
      dataValidadePlano: p.dataValidadePlano || '',
    })
    setErro('')
    setSucesso('')
    window.scrollTo(0, 0) // sobe a página até o formulário
  }

  // Cancela a edição e volta o formulário ao normal (modo cadastrar).
  function cancelarEdicao() {
    setEditandoId(null)
    setForm(FORM_VAZIO)
    setErro('')
    setSucesso('')
  }

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')

    // Montamos o objeto que o backend espera. Os campos vazios viram null
    // (assim não enviamos texto vazio para datas, por exemplo).
    const paciente = {
      nomeCompleto: form.nomeCompleto,
      cpf: form.cpf,
      dataNascimento: form.dataNascimento || null,
      rg: form.rg || null,
      sexo: form.sexo || null,
      telefone: form.telefone,
      email: form.email || null,
      endereco: form.endereco || null,
      cidade: form.cidade || null,
      estado: form.estado || null,
      cep: form.cep || null,
      numeroCarteirinha: form.numeroCarteirinha || null,
      dataValidadePlano: form.dataValidadePlano || null,
      // Se o usuário escolheu um plano, enviamos { idPlano: X }; senão, null.
      plano: form.idPlano ? { idPlano: Number(form.idPlano) } : null,
    }

    try {
      // Se temos um id em edição, ATUALIZA; senão, CRIA um novo.
      if (editandoId) {
        await atualizarPaciente(editandoId, paciente)
        setSucesso('Paciente atualizado com sucesso!')
      } else {
        await criarPaciente(paciente)
        setSucesso('Paciente cadastrado com sucesso!')
      }
      // Limpa o formulário e volta para o modo cadastrar.
      setEditandoId(null)
      setForm(FORM_VAZIO)
      carregarPacientes()
    } catch (e) {
      // Aqui aparece, por exemplo, "Já existe um paciente cadastrado com este CPF."
      setErro(e.message)
    }
  }

  return (
    <div>
      <div className="card">
        <h1>Pacientes</h1>
        {/* O subtítulo muda conforme estamos cadastrando ou editando. */}
        <p className="subtitulo">
          {editandoId
            ? 'Editando o paciente #' + editandoId + ' — altere os dados e salve.'
            : 'Cadastre os pacientes da clínica.'}
        </p>

        {erro && <div className="mensagem-erro">{erro}</div>}
        {sucesso && <div className="mensagem-sucesso">{sucesso}</div>}

        <form onSubmit={enviar}>
          <div className="campo">
            <label>Nome completo *</label>
            <input name="nomeCompleto" value={form.nomeCompleto} onChange={atualizarCampo} required />
          </div>

          <div className="grade">
            <div className="campo">
              <label>CPF * (só números)</label>
              <input name="cpf" value={form.cpf} onChange={atualizarCampo} maxLength="11" required />
            </div>
            <div className="campo">
              <label>RG</label>
              <input name="rg" value={form.rg} onChange={atualizarCampo} />
            </div>
            <div className="campo">
              <label>Data de nascimento</label>
              <input name="dataNascimento" type="date" value={form.dataNascimento} onChange={atualizarCampo} />
            </div>
            <div className="campo">
              <label>Sexo</label>
              <select name="sexo" value={form.sexo} onChange={atualizarCampo}>
                <option value="">Selecione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Prefiro não dizer">Prefiro não dizer</option>
              </select>
            </div>
            <div className="campo">
              <label>Telefone *</label>
              <input name="telefone" value={form.telefone} onChange={atualizarCampo} required />
            </div>
            <div className="campo">
              <label>E-mail</label>
              <input name="email" type="email" value={form.email} onChange={atualizarCampo} />
            </div>
            <div className="campo">
              <label>Endereço</label>
              <input name="endereco" value={form.endereco} onChange={atualizarCampo} />
            </div>
            <div className="campo">
              <label>Cidade</label>
              <input name="cidade" value={form.cidade} onChange={atualizarCampo} />
            </div>
            <div className="campo">
              <label>Estado (UF)</label>
              <input name="estado" value={form.estado} onChange={atualizarCampo} maxLength="2" />
            </div>
            <div className="campo">
              <label>CEP (só números)</label>
              <input name="cep" value={form.cep} onChange={atualizarCampo} maxLength="8" />
            </div>
            <div className="campo">
              <label>Plano odontológico</label>
              <select name="idPlano" value={form.idPlano} onChange={atualizarCampo}>
                <option value="">Sem plano (particular)</option>
                {planos.map((p) => (
                  <option key={p.idPlano} value={p.idPlano}>
                    {p.nomePlano}
                  </option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label>Número da carteirinha</label>
              <input name="numeroCarteirinha" value={form.numeroCarteirinha} onChange={atualizarCampo} />
            </div>
            <div className="campo">
              <label>Validade do plano</label>
              <input name="dataValidadePlano" type="date" value={form.dataValidadePlano} onChange={atualizarCampo} />
            </div>
          </div>

          {/* O texto do botão muda conforme o modo (cadastrar ou editar). */}
          <button type="submit">
            {editandoId ? 'Salvar alterações' : 'Cadastrar paciente'}
          </button>
          {/* O botão de cancelar só aparece durante a edição. */}
          {editandoId && (
            <button type="button" className="btn-cancelar" onClick={cancelarEdicao}>
              Cancelar
            </button>
          )}
        </form>
      </div>

      <div className="card">
        <h2>Pacientes cadastrados ({lista.length})</h2>

        {/* Barra de busca por nome ou CPF. */}
        <form className="barra-busca" onSubmit={buscar}>
          <input
            placeholder="Buscar por nome ou CPF..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Plano</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.idPaciente}>
                <td>{p.idPaciente}</td>
                <td>{p.nomeCompleto}</td>
                <td>{p.cpf}</td>
                <td>{p.telefone}</td>
                {/* Se o paciente tem plano, mostramos o nome; senão, "Particular". */}
                <td>{p.plano ? p.plano.nomePlano : 'Particular'}</td>
                <td>
                  {/* Botão que coloca este paciente no formulário para editar. */}
                  <button className="btn-acao" onClick={() => iniciarEdicao(p)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Pacientes
