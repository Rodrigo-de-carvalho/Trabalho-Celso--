// Home.js — Painel inicial do sistema (Dashboard).
// Mostra os números atuais da clínica e os próximos agendamentos, puxando os
// dados da API. É a "tela de visão geral" de quem abre o sistema.
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  listarPacientes,
  listarDentistas,
  listarProcedimentos,
  listarAgendamentos,
  listarConsultas,
} from '../api'

function Home() {
  // Guarda a quantidade de registros de cada tipo (para os cartões do painel).
  const [contagem, setContagem] = useState({
    pacientes: 0,
    dentistas: 0,
    procedimentos: 0,
    agendamentos: 0,
    consultas: 0,
  })

  // Lista dos próximos agendamentos (os que ainda vão acontecer).
  const [proximos, setProximos] = useState([])

  // Mensagem de erro (ex: backend desligado).
  const [erro, setErro] = useState('')

  // Ao abrir a tela, carregamos todos os dados do painel.
  useEffect(() => {
    carregarPainel()
  }, [])

  async function carregarPainel() {
    setErro('')
    try {
      // Promise.all dispara todas as buscas ao mesmo tempo e espera todas terminarem.
      // Fica mais rápido do que buscar uma de cada vez.
      const [pacientes, dentistas, procedimentos, agendamentos, consultas] =
        await Promise.all([
          listarPacientes(),
          listarDentistas(),
          listarProcedimentos(),
          listarAgendamentos(),
          listarConsultas(),
        ])

      // Atualiza os números dos cartões com o tamanho de cada lista.
      setContagem({
        pacientes: pacientes.length,
        dentistas: dentistas.length,
        procedimentos: procedimentos.length,
        agendamentos: agendamentos.length,
        consultas: consultas.length,
      })

      // Monta a lista de "próximos agendamentos":
      // 1) pega só os que estão com status "Agendado";
      // 2) mantém só os que têm data/hora no futuro (a partir de agora);
      // 3) ordena do mais próximo para o mais distante;
      // 4) pega no máximo os 5 primeiros.
      const agora = new Date()
      const futuros = agendamentos
        .filter((a) => a.status === 'Agendado')
        .filter((a) => new Date(a.dataHora) >= agora)
        .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))
        .slice(0, 5)

      setProximos(futuros)
    } catch (e) {
      setErro('Não foi possível carregar os dados. Verifique se o backend está ligado.')
    }
  }

  // Transforma "2026-07-01T09:00:00" em algo legível em português (01/07/2026 09:00).
  function formatarDataHora(texto) {
    if (!texto) return ''
    return new Date(texto).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      <div className="card">
        <h1>Painel da Clínica</h1>
        <p className="subtitulo">Visão geral do sistema de gestão odontológica.</p>

        {erro && <div className="mensagem-erro">{erro}</div>}

        {/* Cartões com os números atuais. Cada um é um link para a tela correspondente. */}
        <div className="stats-grid">
          <Link to="/pacientes" className="stat-card">
            <div className="stat-numero">{contagem.pacientes}</div>
            <div className="stat-rotulo">Pacientes</div>
          </Link>
          <Link to="/dentistas" className="stat-card">
            <div className="stat-numero">{contagem.dentistas}</div>
            <div className="stat-rotulo">Dentistas</div>
          </Link>
          <Link to="/procedimentos" className="stat-card">
            <div className="stat-numero">{contagem.procedimentos}</div>
            <div className="stat-rotulo">Procedimentos</div>
          </Link>
          <Link to="/agendamentos" className="stat-card">
            <div className="stat-numero">{contagem.agendamentos}</div>
            <div className="stat-rotulo">Agendamentos</div>
          </Link>
          <Link to="/consultas" className="stat-card">
            <div className="stat-numero">{contagem.consultas}</div>
            <div className="stat-rotulo">Consultas</div>
          </Link>
        </div>

        {/* Botões de atalho para as ações mais usadas no dia a dia. */}
        <h2>Ações rápidas</h2>
        <div className="acoes-rapidas">
          <Link to="/pacientes">+ Novo paciente</Link>
          <Link to="/agendamentos">+ Novo agendamento</Link>
          <Link to="/consultas">+ Registrar consulta</Link>
          <Link to="/pagamentos">+ Registrar pagamento</Link>
        </div>
      </div>

      {/* Lista dos próximos atendimentos marcados. */}
      <div className="card">
        <h2>Próximos agendamentos</h2>
        {proximos.length === 0 ? (
          <p className="vazio">Nenhum agendamento futuro no momento.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Paciente</th>
                <th>Dentista</th>
                <th>Procedimento</th>
              </tr>
            </thead>
            <tbody>
              {proximos.map((a) => (
                <tr key={a.idAgendamento}>
                  <td>{formatarDataHora(a.dataHora)}</td>
                  {/* O "?." evita erro caso algum dado venha nulo. */}
                  <td>{a.paciente?.nomeCompleto}</td>
                  <td>{a.dentista?.nomeCompleto}</td>
                  <td>{a.procedimento?.nome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Home
