// ============================================================
//  Painel.tsx — Tela inicial com os indicadores
// ============================================================
// A MESMA tela serve aos dois perfis: a API devolve os números conforme quem
// está logado (o administrador recebe a visão geral; o psicólogo, só a dele).

import { useEffect, useState } from 'react'
import * as api from '../api'
import { Painel as DadosDoPainel } from '../tipos'
import { useAutenticacao } from '../contexto/Autenticacao'
import { Erro } from '../componentes/Mensagens'
import { formatarDataHora } from '../util/formatar'

export function Painel() {
  const { usuario } = useAutenticacao()
  const [dados, setDados] = useState<DadosDoPainel | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    api
      .carregarPainel()
      .then(setDados)
      .catch((e) => setErro(e.message))
  }, [])

  if (erro) return <Erro texto={erro} />
  if (!dados) return <p className="carregando">Carregando indicadores…</p>

  const ehAdministrador = usuario?.perfil === 'Administrador'

  return (
    <div>
      <div className="cartao">
        <h1>Olá, {usuario?.nomeCompleto}</h1>
        <p className="subtitulo">
          {ehAdministrador
            ? 'Visão geral da operação da clínica.'
            : 'Resumo dos seus pacientes e da sua agenda.'}
        </p>
      </div>

      {/* ---- Números principais ---- */}
      <div className="grade-indicadores">
        {dados.usuarios && (
          <>
            <Indicador titulo="Usuários" valor={dados.usuarios.total} detalhe="cadastrados" />
            <Indicador titulo="Ativos" valor={dados.usuarios.Ativo} detalhe="podem entrar" />
            <Indicador titulo="Inativos" valor={dados.usuarios.Inativo} detalhe="sem acesso" />
            <Indicador
              titulo="Bloqueados"
              valor={dados.usuarios.Bloqueado}
              detalhe="acesso suspenso"
            />
          </>
        )}
        {dados.psicologos && (
          <Indicador titulo="Psicólogos" valor={dados.psicologos.total} detalhe="cadastrados" />
        )}
        <Indicador
          titulo={ehAdministrador ? 'Clientes/Pacientes' : 'Meus pacientes'}
          valor={dados.clientes.total}
          detalhe={`${dados.clientes.ativos} ativos`}
        />
      </div>

      {/* ---- Indicadores da agenda (funcionalidade inovadora) ---- */}
      <div className="cartao">
        <h2>Agenda com confirmação</h2>
        <p className="subtitulo">
          Acompanhamento do ciclo de vida dos atendimentos — é daqui que saem a taxa de
          confirmação e a taxa de faltas.
        </p>

        <div className="grade-indicadores">
          <Indicador
            titulo="Taxa de confirmação"
            valor={dados.agenda.taxaConfirmacao + '%'}
            detalhe="dos atendimentos"
            destaque
          />
          <Indicador
            titulo="Taxa de faltas"
            valor={dados.agenda.taxaFalta + '%'}
            detalhe="dos já ocorridos"
            alerta={dados.agenda.taxaFalta > 20}
          />
          <Indicador titulo="Agendados" valor={dados.agenda.agendados} detalhe="aguardando confirmação" />
          <Indicador titulo="Confirmados" valor={dados.agenda.confirmados} detalhe="presença confirmada" />
          <Indicador titulo="Realizados" valor={dados.agenda.realizados} detalhe="concluídos" />
          <Indicador titulo="Faltas" valor={dados.agenda.faltas} detalhe="sem comparecimento" />
        </div>
      </div>

      {/* ---- Próximos compromissos ---- */}
      <div className="cartao">
        <h2>Próximos atendimentos</h2>
        {dados.agenda.proximos.length === 0 ? (
          <p className="vazio">Nenhum atendimento futuro agendado.</p>
        ) : (
          <div className="tabela-rolavel">
            <table>
              <thead>
                <tr>
                  <th>Data e hora</th>
                  <th>Cliente/Paciente</th>
                  {ehAdministrador && <th>Psicólogo</th>}
                  <th>Modalidade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dados.agenda.proximos.map((a) => (
                  <tr key={a.idAtendimento}>
                    <td>{formatarDataHora(a.dataHora)}</td>
                    <td>{a.cliente.nomeCompleto}</td>
                    {ehAdministrador && <td>{a.psicologo.usuario.nomeCompleto}</td>}
                    <td>{a.modalidade}</td>
                    <td>
                      <span className={'etiqueta etiqueta-' + a.status.toLowerCase()}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/** Cartãozinho de número usado nos painéis. */
function Indicador({
  titulo,
  valor,
  detalhe,
  destaque,
  alerta,
}: {
  titulo: string
  valor: number | string
  detalhe?: string
  destaque?: boolean
  alerta?: boolean
}) {
  const classes = ['indicador']
  if (destaque) classes.push('indicador-destaque')
  if (alerta) classes.push('indicador-alerta')

  return (
    <div className={classes.join(' ')}>
      <span className="indicador-titulo">{titulo}</span>
      <strong className="indicador-valor">{valor}</strong>
      {detalhe && <span className="indicador-detalhe">{detalhe}</span>}
    </div>
  )
}
