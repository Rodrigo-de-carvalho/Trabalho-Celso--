// ============================================================
//  Pacientes.tsx — Gestão de clientes/pacientes
// ============================================================
// Esta tela é usada pelos três perfis, mas cada um vê uma coisa: o psicólogo
// enxerga apenas os pacientes vinculados a ele. Quem faz esse recorte é o
// back-end — a tela apenas exibe o que a API autorizou.

import { FormEvent, useCallback, useEffect, useState } from 'react'
import * as api from '../api'
import { ClientePaciente } from '../tipos'
import { Erro, Sucesso } from '../componentes/Mensagens'
import { calcularIdade, formatarData } from '../util/formatar'

const FORMULARIO_VAZIO = {
  nomeCompleto: '',
  dataNascimento: '',
  email: '',
  telefone: '',
  cidade: '',
  estado: '',
  observacoesAdministrativas: '',
}

export function Pacientes() {
  const [lista, setLista] = useState<ClientePaciente[]>([])
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO)
  // Quando não é null, estamos EDITANDO o paciente deste id.
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [termo, setTermo] = useState('')
  const [filtroSituacao, setFiltroSituacao] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const carregar = useCallback(async () => {
    try {
      setLista(await api.listarPacientes({ termo, situacao: filtroSituacao }))
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar os pacientes.')
    }
  }, [termo, filtroSituacao])

  useEffect(() => {
    carregar()
  }, [carregar])

  function atualizarCampo(campo: keyof typeof FORMULARIO_VAZIO, valor: string) {
    setFormulario({ ...formulario, [campo]: valor })
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault()
    setErro('')
    setSucesso('')

    // Campos vazios viram null: assim o banco guarda "sem informação" em vez de
    // um texto em branco.
    const dados = {
      nomeCompleto: formulario.nomeCompleto,
      telefone: formulario.telefone,
      dataNascimento: formulario.dataNascimento || null,
      email: formulario.email || null,
      cidade: formulario.cidade || null,
      estado: formulario.estado || null,
      observacoesAdministrativas: formulario.observacoesAdministrativas || null,
    }

    try {
      if (editandoId === null) {
        await api.criarPaciente(dados)
        setSucesso('Cliente/paciente cadastrado com sucesso.')
      } else {
        await api.atualizarPaciente(editandoId, dados)
        setSucesso('Cadastro atualizado com sucesso.')
      }
      cancelarEdicao()
      carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar o cadastro.')
    }
  }

  function iniciarEdicao(cliente: ClientePaciente) {
    setEditandoId(cliente.idCliente)
    setFormulario({
      nomeCompleto: cliente.nomeCompleto,
      dataNascimento: cliente.dataNascimento ?? '',
      email: cliente.email ?? '',
      telefone: cliente.telefone,
      cidade: cliente.cidade ?? '',
      estado: cliente.estado ?? '',
      observacoesAdministrativas: cliente.observacoesAdministrativas ?? '',
    })
    setErro('')
    setSucesso('')
    window.scrollTo(0, 0)
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setFormulario(FORMULARIO_VAZIO)
  }

  /**
   * Ativa ou inativa o cadastro.
   *
   * Não existe botão de excluir: pelo edital, quando há histórico a preservar
   * (atendimentos já realizados), o certo é INATIVAR o registro.
   */
  async function alternarSituacao(cliente: ClientePaciente) {
    const nova = cliente.situacao === 'Ativo' ? 'Inativo' : 'Ativo'
    setErro('')
    setSucesso('')
    try {
      await api.atualizarPaciente(cliente.idCliente, { situacao: nova })
      setSucesso(`${cliente.nomeCompleto} agora está ${nova}.`)
      carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao alterar a situação.')
    }
  }

  return (
    <div>
      <div className="cartao">
        <h1>{editandoId === null ? 'Novo cliente/paciente' : 'Editando cadastro'}</h1>
        <p className="subtitulo">
          Apenas dados administrativos. Informações clínicas de sessão não são registradas
          no sistema.
        </p>

        <Erro texto={erro} />
        <Sucesso texto={sucesso} />

        <form onSubmit={salvar} className="formulario">
          <div className="grade-campos">
            <div className="campo">
              <label htmlFor="nome-cli">Nome completo *</label>
              <input
                id="nome-cli"
                value={formulario.nomeCompleto}
                onChange={(e) => atualizarCampo('nomeCompleto', e.target.value)}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="tel-cli">Telefone *</label>
              <input
                id="tel-cli"
                value={formulario.telefone}
                onChange={(e) => atualizarCampo('telefone', e.target.value)}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="nasc-cli">Data de nascimento</label>
              <input
                id="nasc-cli"
                type="date"
                value={formulario.dataNascimento}
                onChange={(e) => atualizarCampo('dataNascimento', e.target.value)}
              />
            </div>
            <div className="campo">
              <label htmlFor="email-cli">E-mail</label>
              <input
                id="email-cli"
                type="email"
                value={formulario.email}
                onChange={(e) => atualizarCampo('email', e.target.value)}
              />
            </div>
            <div className="campo">
              <label htmlFor="cidade-cli">Cidade</label>
              <input
                id="cidade-cli"
                value={formulario.cidade}
                onChange={(e) => atualizarCampo('cidade', e.target.value)}
              />
            </div>
            <div className="campo">
              <label htmlFor="uf-cli">Estado (UF)</label>
              <input
                id="uf-cli"
                maxLength={2}
                value={formulario.estado}
                onChange={(e) => atualizarCampo('estado', e.target.value.toUpperCase())}
              />
            </div>
            <div className="campo campo-largo">
              <label htmlFor="obs-cli">Observações administrativas</label>
              <textarea
                id="obs-cli"
                rows={2}
                value={formulario.observacoesAdministrativas}
                onChange={(e) => atualizarCampo('observacoesAdministrativas', e.target.value)}
              />
            </div>
          </div>

          <div className="linha-botoes">
            <button type="submit" className="botao-primario">
              {editandoId === null ? 'Cadastrar' : 'Salvar alterações'}
            </button>
            {editandoId !== null && (
              <button type="button" className="botao-secundario" onClick={cancelarEdicao}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="cartao">
        <h2>Clientes/Pacientes ({lista.length})</h2>

        <div className="barra-de-filtros">
          <input
            placeholder="Buscar por nome…"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            aria-label="Buscar clientes ou pacientes"
          />
          <select
            value={filtroSituacao}
            onChange={(e) => setFiltroSituacao(e.target.value)}
            aria-label="Filtrar por situação"
          >
            <option value="">Todas as situações</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>

        <div className="tabela-rolavel">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Idade</th>
                <th>Telefone</th>
                <th>Cidade/UF</th>
                <th>Cadastro</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => (
                <tr key={c.idCliente} className={c.situacao === 'Inativo' ? 'linha-inativa' : ''}>
                  <td>{c.nomeCompleto}</td>
                  <td>{calcularIdade(c.dataNascimento)}</td>
                  <td>{c.telefone}</td>
                  <td>{c.cidade ? `${c.cidade}/${c.estado ?? '—'}` : '—'}</td>
                  <td>{formatarData(c.dataCadastro)}</td>
                  <td>
                    <span className={'etiqueta etiqueta-' + c.situacao.toLowerCase()}>
                      {c.situacao}
                    </span>
                  </td>
                  <td className="celula-acoes">
                    <button
                      type="button"
                      className="botao-secundario"
                      onClick={() => iniciarEdicao(c)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="botao-secundario"
                      onClick={() => alternarSituacao(c)}
                    >
                      {c.situacao === 'Ativo' ? 'Inativar' : 'Reativar'}
                    </button>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={7} className="vazio">
                    Nenhum cliente/paciente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
