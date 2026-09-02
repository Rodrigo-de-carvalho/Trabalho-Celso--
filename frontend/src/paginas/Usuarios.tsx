// ============================================================
//  Usuarios.tsx — Gestão de acessos (tela exclusiva do administrador)
// ============================================================
// É aqui que o administrador cadastra usuários, define o perfil de cada um e
// ativa, bloqueia ou libera o acesso.

import { FormEvent, useCallback, useEffect, useState } from 'react'
import * as api from '../api'
import { Perfil, SituacaoUsuario, Usuario } from '../tipos'
import { useAutenticacao } from '../contexto/Autenticacao'
import { Erro, Sucesso } from '../componentes/Mensagens'
import { formatarDataHora } from '../util/formatar'

const FORMULARIO_VAZIO = { nomeCompleto: '', email: '', senha: '', idPerfil: '' }

const SITUACOES: SituacaoUsuario[] = ['Ativo', 'Inativo', 'Bloqueado']

export function Usuarios() {
  const { usuario: logado } = useAutenticacao()

  const [lista, setLista] = useState<Usuario[]>([])
  const [perfis, setPerfis] = useState<Perfil[]>([])
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO)
  const [termo, setTermo] = useState('')
  const [filtroSituacao, setFiltroSituacao] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const carregar = useCallback(async () => {
    try {
      setLista(await api.listarUsuarios({ termo, situacao: filtroSituacao }))
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar usuários.')
    }
  }, [termo, filtroSituacao])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    api.listarPerfis().then(setPerfis).catch(() => undefined)
  }, [])

  async function cadastrar(evento: FormEvent) {
    evento.preventDefault()
    setErro('')
    setSucesso('')
    try {
      await api.criarUsuario({
        nomeCompleto: formulario.nomeCompleto,
        email: formulario.email,
        senha: formulario.senha,
        perfil: { idPerfil: Number(formulario.idPerfil) },
      })
      setSucesso('Usuário cadastrado com sucesso.')
      setFormulario(FORMULARIO_VAZIO)
      carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao cadastrar usuário.')
    }
  }

  /** Ativa, inativa ou bloqueia o acesso de um usuário. */
  async function mudarSituacao(alvo: Usuario, situacao: SituacaoUsuario) {
    setErro('')
    setSucesso('')
    try {
      await api.atualizarUsuario(alvo.idUsuario, { situacao })
      setSucesso(`Situação de ${alvo.nomeCompleto} alterada para ${situacao}.`)
      carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao alterar a situação.')
    }
  }

  async function mudarPerfil(alvo: Usuario, idPerfil: number) {
    setErro('')
    setSucesso('')
    try {
      await api.atualizarUsuario(alvo.idUsuario, { perfil: { idPerfil } })
      setSucesso(`Perfil de ${alvo.nomeCompleto} atualizado.`)
      carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao alterar o perfil.')
    }
  }

  /** Define uma nova senha. Repare que não existe "ver senha": só redefinir. */
  async function redefinirSenha(alvo: Usuario) {
    const nova = window.prompt(`Nova senha para ${alvo.nomeCompleto} (mínimo 6 caracteres):`)
    if (nova === null) return

    setErro('')
    setSucesso('')
    try {
      await api.atualizarUsuario(alvo.idUsuario, { senha: nova })
      setSucesso(`Senha de ${alvo.nomeCompleto} redefinida.`)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao redefinir a senha.')
    }
  }

  return (
    <div>
      <div className="cartao">
        <h1>Usuários</h1>
        <p className="subtitulo">
          Cadastre usuários, defina o perfil de acesso e controle quem pode entrar no sistema.
        </p>

        <Erro texto={erro} />
        <Sucesso texto={sucesso} />

        <form onSubmit={cadastrar} className="formulario">
          <div className="grade-campos">
            <div className="campo">
              <label htmlFor="nome">Nome completo *</label>
              <input
                id="nome"
                value={formulario.nomeCompleto}
                onChange={(e) => setFormulario({ ...formulario, nomeCompleto: e.target.value })}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="email-novo">E-mail *</label>
              <input
                id="email-novo"
                type="email"
                value={formulario.email}
                onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="senha-nova">Senha provisória *</label>
              <input
                id="senha-nova"
                type="password"
                minLength={6}
                value={formulario.senha}
                onChange={(e) => setFormulario({ ...formulario, senha: e.target.value })}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="perfil">Perfil de acesso *</label>
              <select
                id="perfil"
                value={formulario.idPerfil}
                onChange={(e) => setFormulario({ ...formulario, idPerfil: e.target.value })}
                required
              >
                <option value="">Selecione…</option>
                {perfis.map((p) => (
                  <option key={p.idPerfil} value={p.idPerfil}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="botao-primario">
            Cadastrar usuário
          </button>
        </form>
      </div>

      <div className="cartao">
        <h2>Usuários cadastrados ({lista.length})</h2>

        <div className="barra-de-filtros">
          <input
            placeholder="Buscar por nome ou e-mail…"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            aria-label="Buscar usuários"
          />
          <select
            value={filtroSituacao}
            onChange={(e) => setFiltroSituacao(e.target.value)}
            aria-label="Filtrar por situação"
          >
            <option value="">Todas as situações</option>
            {SITUACOES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="tabela-rolavel">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Situação</th>
                <th>Último acesso</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((u) => {
                // Regra do sistema: ninguém altera o próprio acesso. O back-end
                // recusa de qualquer jeito; aqui desabilitamos para ficar claro.
                const ehVoceMesmo = u.idUsuario === logado?.idUsuario

                return (
                  <tr key={u.idUsuario}>
                    <td>
                      {u.nomeCompleto}
                      {ehVoceMesmo && <span className="etiqueta-voce">você</span>}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.perfil.idPerfil}
                        disabled={ehVoceMesmo}
                        onChange={(e) => mudarPerfil(u, Number(e.target.value))}
                        aria-label={`Perfil de ${u.nomeCompleto}`}
                      >
                        {perfis.map((p) => (
                          <option key={p.idPerfil} value={p.idPerfil}>
                            {p.nome}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={'etiqueta etiqueta-' + u.situacao.toLowerCase()}>
                        {u.situacao}
                      </span>
                    </td>
                    <td>{formatarDataHora(u.ultimoAcesso)}</td>
                    <td className="celula-acoes">
                      {SITUACOES.filter((s) => s !== u.situacao).map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="botao-secundario"
                          disabled={ehVoceMesmo}
                          onClick={() => mudarSituacao(u, s)}
                        >
                          {s === 'Ativo' ? 'Liberar' : s === 'Inativo' ? 'Inativar' : 'Bloquear'}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="botao-secundario"
                        onClick={() => redefinirSenha(u)}
                      >
                        Redefinir senha
                      </button>
                    </td>
                  </tr>
                )
              })}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={6} className="vazio">
                    Nenhum usuário encontrado com esses filtros.
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
