// ============================================================
//  Auditoria.tsx — Consulta dos registros de ações (administrador)
// ============================================================
// Mostra QUEM fez O QUÊ e QUANDO. É uma tela apenas de leitura: nem o
// administrador pode apagar registros de auditoria, e por isso não existe
// nenhum botão de exclusão aqui — nem rota para isso na API.

import { useEffect, useState } from 'react'
import * as api from '../api'
import { LogAcao } from '../tipos'
import { Erro } from '../componentes/Mensagens'
import { formatarDataHora } from '../util/formatar'

export function Auditoria() {
  const [lista, setLista] = useState<LogAcao[]>([])
  const [filtro, setFiltro] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    api
      .listarLogs()
      .then(setLista)
      .catch((e) => setErro(e.message))
  }, [])

  const termo = filtro.trim().toLowerCase()
  const visiveis = lista.filter(
    (l) =>
      termo === '' ||
      l.acao.toLowerCase().includes(termo) ||
      l.entidade.toLowerCase().includes(termo) ||
      (l.usuario?.nomeCompleto ?? '').toLowerCase().includes(termo) ||
      (l.detalhes ?? '').toLowerCase().includes(termo)
  )

  return (
    <div className="cartao">
      <h1>Auditoria</h1>
      <p className="subtitulo">
        Registro das operações relevantes do sistema. Somente leitura — estes registros
        nunca são apagados.
      </p>

      <Erro texto={erro} />

      <div className="barra-de-filtros">
        <input
          placeholder="Filtrar por ação, usuário, tabela ou detalhe…"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          aria-label="Filtrar registros de auditoria"
        />
      </div>

      <div className="tabela-rolavel">
        <table>
          <thead>
            <tr>
              <th>Data e hora</th>
              <th>Usuário</th>
              <th>Ação</th>
              <th>Registro</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((l) => (
              <tr key={l.idLog}>
                <td>{formatarDataHora(l.dataHora)}</td>
                <td>{l.usuario?.nomeCompleto ?? 'Sistema'}</td>
                <td>
                  <span className={'etiqueta etiqueta-acao'}>{l.acao}</span>
                </td>
                <td>
                  {l.entidade}
                  {l.idEntidade !== null && ' #' + l.idEntidade}
                </td>
                <td>{l.detalhes ?? '—'}</td>
              </tr>
            ))}
            {visiveis.length === 0 && (
              <tr>
                <td colSpan={5} className="vazio">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
