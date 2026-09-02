// ============================================================
//  Psicologos.tsx — Cadastro dos profissionais e seus vínculos
// ============================================================
// Tela do administrador. Além de cadastrar o profissional, é aqui que ele liga
// cada cliente/paciente a um psicólogo — e esse vínculo é o que define o que
// cada profissional consegue enxergar no sistema.

import { FormEvent, useCallback, useEffect, useState } from 'react'
import * as api from '../api'
import { ClientePaciente, Psicologo, Usuario, Vinculo } from '../tipos'
import { Erro, Sucesso } from '../componentes/Mensagens'
import { formatarData } from '../util/formatar'

const AREAS = [
  'Clínica',
  'Organizacional e do Trabalho',
  'Escolar e Educacional',
  'Hospitalar',
  'Social',
  'Jurídica',
  'Do Esporte',
  'Do Trânsito',
  'Neuropsicologia',
  'Pesquisa e Docência',
]

const FORMULARIO_VAZIO = { idUsuario: '', crp: '', areaAtuacao: '', abordagem: '', telefone: '' }

export function Psicologos() {
  const [lista, setLista] = useState<Psicologo[]>([])
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState<Usuario[]>([])
  const [pacientes, setPacientes] = useState<ClientePaciente[]>([])
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO)

  // Qual psicólogo está com o painel de vínculos aberto.
  const [selecionado, setSelecionado] = useState<Psicologo | null>(null)
  const [vinculos, setVinculos] = useState<Vinculo[]>([])
  const [idClienteParaVincular, setIdClienteParaVincular] = useState('')

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const carregar = useCallback(async () => {
    try {
      const [psicologos, usuarios, clientes] = await Promise.all([
        api.listarPsicologos(),
        api.listarUsuarios(),
        api.listarPacientes(),
      ])
      setLista(psicologos)
      setPacientes(clientes)

      // No formulário só aparecem os usuários com perfil de psicólogo que
      // ainda NÃO têm cadastro profissional — evita erro antes de enviar.
      const jaCadastrados = new Set(psicologos.map((p) => p.usuario.idUsuario))
      setUsuariosDisponiveis(
        usuarios.filter((u) => u.perfil.nome === 'Psicologo' && !jaCadastrados.has(u.idUsuario))
      )
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar os dados.')
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function cadastrar(evento: FormEvent) {
    evento.preventDefault()
    setErro('')
    setSucesso('')
    try {
      await api.criarPsicologo({
        usuario: { idUsuario: Number(formulario.idUsuario) },
        crp: formulario.crp,
        areaAtuacao: formulario.areaAtuacao,
        abordagem: formulario.abordagem || null,
        telefone: formulario.telefone || null,
      })
      setSucesso('Psicólogo cadastrado com sucesso.')
      setFormulario(FORMULARIO_VAZIO)
      carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao cadastrar o psicólogo.')
    }
  }

  async function abrirVinculos(psicologo: Psicologo) {
    setErro('')
    setSucesso('')
    setSelecionado(psicologo)
    setIdClienteParaVincular('')
    try {
      setVinculos(await api.listarVinculosDoPsicologo(psicologo.idPsicologo))
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar os vínculos.')
    }
  }

  async function vincular(evento: FormEvent) {
    evento.preventDefault()
    if (!selecionado) return
    setErro('')
    setSucesso('')
    try {
      await api.vincularPaciente(selecionado.idPsicologo, Number(idClienteParaVincular))
      setSucesso('Vínculo criado com sucesso.')
      abrirVinculos(selecionado)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao criar o vínculo.')
    }
  }

  async function encerrar(vinculo: Vinculo) {
    if (!selecionado) return
    setErro('')
    setSucesso('')
    try {
      await api.encerrarVinculo(vinculo.idVinculo)
      setSucesso('Vínculo encerrado.')
      abrirVinculos(selecionado)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao encerrar o vínculo.')
    }
  }

  return (
    <div>
      <div className="cartao">
        <h1>Psicólogos</h1>
        <p className="subtitulo">
          O cadastro profissional é feito a partir de um usuário já existente com o perfil
          &ldquo;Psicologo&rdquo;.
        </p>

        <Erro texto={erro} />
        <Sucesso texto={sucesso} />

        <form onSubmit={cadastrar} className="formulario">
          <div className="grade-campos">
            <div className="campo">
              <label htmlFor="usuario">Usuário do sistema *</label>
              <select
                id="usuario"
                value={formulario.idUsuario}
                onChange={(e) => setFormulario({ ...formulario, idUsuario: e.target.value })}
                required
              >
                <option value="">Selecione…</option>
                {usuariosDisponiveis.map((u) => (
                  <option key={u.idUsuario} value={u.idUsuario}>
                    {u.nomeCompleto} ({u.email})
                  </option>
                ))}
              </select>
              {usuariosDisponiveis.length === 0 && (
                <small className="ajuda">
                  Nenhum usuário disponível. Cadastre antes um usuário com o perfil
                  &ldquo;Psicologo&rdquo; na tela de Usuários.
                </small>
              )}
            </div>
            <div className="campo">
              <label htmlFor="crp">CRP *</label>
              <input
                id="crp"
                placeholder="CRP 03/12345"
                value={formulario.crp}
                onChange={(e) => setFormulario({ ...formulario, crp: e.target.value })}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="area">Área de atuação *</label>
              <select
                id="area"
                value={formulario.areaAtuacao}
                onChange={(e) => setFormulario({ ...formulario, areaAtuacao: e.target.value })}
                required
              >
                <option value="">Selecione…</option>
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label htmlFor="abordagem">Abordagem</label>
              <input
                id="abordagem"
                value={formulario.abordagem}
                onChange={(e) => setFormulario({ ...formulario, abordagem: e.target.value })}
              />
            </div>
            <div className="campo">
              <label htmlFor="telefone-psi">Telefone</label>
              <input
                id="telefone-psi"
                value={formulario.telefone}
                onChange={(e) => setFormulario({ ...formulario, telefone: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="botao-primario">
            Cadastrar psicólogo
          </button>
        </form>
      </div>

      <div className="cartao">
        <h2>Profissionais cadastrados ({lista.length})</h2>
        <div className="tabela-rolavel">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CRP</th>
                <th>Área de atuação</th>
                <th>Abordagem</th>
                <th>Acesso</th>
                <th>Pacientes</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.idPsicologo}>
                  <td>{p.usuario.nomeCompleto}</td>
                  <td>{p.crp}</td>
                  <td>{p.areaAtuacao}</td>
                  <td>{p.abordagem ?? '—'}</td>
                  <td>
                    <span className={'etiqueta etiqueta-' + p.usuario.situacao.toLowerCase()}>
                      {p.usuario.situacao}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="botao-secundario"
                      onClick={() => abrirVinculos(p)}
                    >
                      Gerenciar vínculos
                    </button>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={6} className="vazio">
                    Nenhum psicólogo cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Painel de vínculos do psicólogo selecionado ---- */}
      {selecionado && (
        <div className="cartao">
          <h2>Pacientes de {selecionado.usuario.nomeCompleto}</h2>
          <p className="subtitulo">
            O psicólogo enxerga no sistema apenas os pacientes com vínculo ativo.
          </p>

          <form onSubmit={vincular} className="linha-formulario">
            <div className="campo">
              <label htmlFor="cliente-vinculo">Vincular cliente/paciente</label>
              <select
                id="cliente-vinculo"
                value={idClienteParaVincular}
                onChange={(e) => setIdClienteParaVincular(e.target.value)}
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
            <button type="submit" className="botao-primario">
              Vincular
            </button>
            <button
              type="button"
              className="botao-secundario"
              onClick={() => setSelecionado(null)}
            >
              Fechar
            </button>
          </form>

          <div className="tabela-rolavel">
            <table>
              <thead>
                <tr>
                  <th>Cliente/Paciente</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Situação do vínculo</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {vinculos.map((v) => (
                  <tr key={v.idVinculo}>
                    <td>{v.cliente.nomeCompleto}</td>
                    <td>{formatarData(v.dataInicio)}</td>
                    <td>{formatarData(v.dataFim)}</td>
                    <td>
                      <span className={'etiqueta ' + (v.ativo ? 'etiqueta-ativo' : 'etiqueta-inativo')}>
                        {v.ativo ? 'Ativo' : 'Encerrado'}
                      </span>
                    </td>
                    <td>
                      {v.ativo && (
                        <button
                          type="button"
                          className="botao-secundario"
                          onClick={() => encerrar(v)}
                        >
                          Encerrar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {vinculos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="vazio">
                      Este psicólogo ainda não tem pacientes vinculados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
