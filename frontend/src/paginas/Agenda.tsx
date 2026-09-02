// ============================================================
//  Agenda.tsx — Agenda com confirmação (FUNCIONALIDADE INOVADORA)
// ============================================================
// O diferencial do produto: além de marcar o horário, a agenda acompanha o
// CICLO DE VIDA do atendimento.
//
//     Agendado --confirmar--> Confirmado --> Realizado
//         \                        \
//          \--> Cancelado           \--> Falta
//
// Cada mudança de status vira um dado, e desses dados nascem a taxa de
// confirmação e a taxa de faltas mostradas no Painel — informação que hoje se
// perde nas conversas de aplicativo de mensagens.

import { FormEvent, useCallback, useEffect, useState } from 'react'
import * as api from '../api'
import { Atendimento, ClientePaciente, Psicologo, StatusAtendimento } from '../tipos'
import { useAutenticacao } from '../contexto/Autenticacao'
import { Erro, Sucesso } from '../componentes/Mensagens'
import { formatarDataHora } from '../util/formatar'

/** Para cada status, o que ainda pode ser feito (espelha a regra do back-end). */
const PROXIMOS_STATUS: Record<StatusAtendimento, StatusAtendimento[]> = {
  Agendado: ['Cancelado'],
  Confirmado: ['Realizado', 'Falta', 'Cancelado'],
  Realizado: [],
  Cancelado: [],
  Falta: [],
}

const FORMULARIO_VAZIO = {
  idPsicologo: '',
  idCliente: '',
  dataHora: '',
  duracaoMinutos: '50',
  modalidade: 'Presencial',
  observacoes: '',
}

export function Agenda() {
  const { usuario, temPerfil } = useAutenticacao()
  const ehPsicologo = temPerfil('Psicologo')

  const [lista, setLista] = useState<Atendimento[]>([])
  const [pacientes, setPacientes] = useState<ClientePaciente[]>([])
  const [psicologos, setPsicologos] = useState<Psicologo[]>([])
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  // useCallback memoriza a função para o useEffect abaixo saber que ela não
  // muda a cada renderização (evita recarregar a lista sem necessidade).
  const carregar = useCallback(async () => {
    try {
      const [atendimentos, clientes] = await Promise.all([
        api.listarAtendimentos(),
        api.listarPacientes({ situacao: 'Ativo' }),
      ])
      setLista(atendimentos)
      setPacientes(clientes)

      // Só quem não é psicólogo precisa escolher a agenda de alguém: o
      // psicólogo agenda sempre na própria (o back-end garante isso).
      if (!ehPsicologo) {
        setPsicologos(await api.listarPsicologos())
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar a agenda.')
    }
  }, [ehPsicologo])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function agendar(evento: FormEvent) {
    evento.preventDefault()
    setErro('')
    setSucesso('')

    try {
      await api.criarAtendimento({
        ...(ehPsicologo ? {} : { psicologo: { idPsicologo: Number(formulario.idPsicologo) } }),
        cliente: { idCliente: Number(formulario.idCliente) },
        dataHora: formulario.dataHora,
        duracaoMinutos: Number(formulario.duracaoMinutos),
        modalidade: formulario.modalidade,
        observacoes: formulario.observacoes || null,
      })
      setSucesso('Atendimento agendado com sucesso.')
      setFormulario(FORMULARIO_VAZIO)
      carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao agendar o atendimento.')
    }
  }

  /** O passo que dá nome à funcionalidade: registrar a confirmação de presença. */
  async function confirmar(atendimento: Atendimento) {
    setErro('')
    setSucesso('')
    try {
      await api.confirmarAtendimento(atendimento.idAtendimento)
      setSucesso(`Presença de ${atendimento.cliente.nomeCompleto} confirmada.`)
      carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao confirmar o atendimento.')
    }
  }

  async function mudarStatus(atendimento: Atendimento, status: StatusAtendimento) {
    setErro('')
    setSucesso('')
    try {
      await api.atualizarAtendimento(atendimento.idAtendimento, { status })
      setSucesso(`Atendimento #${atendimento.idAtendimento} marcado como ${status}.`)
      carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao atualizar o atendimento.')
    }
  }

  return (
    <div>
      <div className="cartao">
        <h1>Agenda</h1>
        <p className="subtitulo">
          {ehPsicologo
            ? 'Seus atendimentos. Confirme a presença para acompanhar os indicadores.'
            : 'Atendimentos de toda a clínica.'}
        </p>

        <Erro texto={erro} />
        <Sucesso texto={sucesso} />

        <form onSubmit={agendar} className="formulario">
          <div className="grade-campos">
            {!ehPsicologo && (
              <div className="campo">
                <label htmlFor="psi-agenda">Psicólogo *</label>
                <select
                  id="psi-agenda"
                  value={formulario.idPsicologo}
                  onChange={(e) => setFormulario({ ...formulario, idPsicologo: e.target.value })}
                  required
                >
                  <option value="">Selecione…</option>
                  {psicologos.map((p) => (
                    <option key={p.idPsicologo} value={p.idPsicologo}>
                      {p.usuario.nomeCompleto} — {p.crp}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="campo">
              <label htmlFor="cli-agenda">Cliente/Paciente *</label>
              <select
                id="cli-agenda"
                value={formulario.idCliente}
                onChange={(e) => setFormulario({ ...formulario, idCliente: e.target.value })}
                required
              >
                <option value="">Selecione…</option>
                {pacientes.map((c) => (
                  <option key={c.idCliente} value={c.idCliente}>
                    {c.nomeCompleto}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label htmlFor="quando">Data e hora *</label>
              <input
                id="quando"
                type="datetime-local"
                value={formulario.dataHora}
                onChange={(e) => setFormulario({ ...formulario, dataHora: e.target.value })}
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="duracao">Duração (minutos)</label>
              <input
                id="duracao"
                type="number"
                min={10}
                max={240}
                value={formulario.duracaoMinutos}
                onChange={(e) => setFormulario({ ...formulario, duracaoMinutos: e.target.value })}
              />
            </div>

            <div className="campo">
              <label htmlFor="modalidade">Modalidade</label>
              <select
                id="modalidade"
                value={formulario.modalidade}
                onChange={(e) => setFormulario({ ...formulario, modalidade: e.target.value })}
              >
                <option value="Presencial">Presencial</option>
                <option value="Online">Online</option>
              </select>
            </div>

            <div className="campo campo-largo">
              <label htmlFor="obs-agenda">Observações</label>
              <input
                id="obs-agenda"
                value={formulario.observacoes}
                onChange={(e) => setFormulario({ ...formulario, observacoes: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="botao-primario">
            Agendar atendimento
          </button>
        </form>
      </div>

      <div className="cartao">
        <h2>Atendimentos ({lista.length})</h2>
        <div className="tabela-rolavel">
          <table>
            <thead>
              <tr>
                <th>Data e hora</th>
                <th>Cliente/Paciente</th>
                {!ehPsicologo && <th>Psicólogo</th>}
                <th>Modalidade</th>
                <th>Status</th>
                <th>Confirmado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((a) => (
                <tr key={a.idAtendimento}>
                  <td>{formatarDataHora(a.dataHora)}</td>
                  <td>{a.cliente.nomeCompleto}</td>
                  {!ehPsicologo && <td>{a.psicologo.usuario.nomeCompleto}</td>}
                  <td>{a.modalidade}</td>
                  <td>
                    <span className={'etiqueta etiqueta-' + a.status.toLowerCase()}>
                      {a.status}
                    </span>
                  </td>
                  <td>{formatarDataHora(a.confirmadoEm)}</td>
                  <td className="celula-acoes">
                    {a.status === 'Agendado' && (
                      <button
                        type="button"
                        className="botao-primario botao-pequeno"
                        onClick={() => confirmar(a)}
                      >
                        Confirmar presença
                      </button>
                    )}
                    {PROXIMOS_STATUS[a.status].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="botao-secundario"
                        onClick={() => mudarStatus(a, s)}
                      >
                        {s === 'Realizado' ? 'Marcar realizado' : s === 'Falta' ? 'Registrar falta' : 'Cancelar'}
                      </button>
                    ))}
                    {PROXIMOS_STATUS[a.status].length === 0 && a.status !== 'Agendado' && (
                      <span className="texto-apagado">encerrado</span>
                    )}
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={ehPsicologo ? 6 : 7} className="vazio">
                    Nenhum atendimento cadastrado. {usuario?.perfil === 'Psicologo' &&
                      'Lembre-se: só é possível agendar para pacientes vinculados a você.'}
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
