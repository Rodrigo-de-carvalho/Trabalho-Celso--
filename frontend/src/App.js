// App.js — Componente principal que monta o menu e define as ROTAS (telas).
import { Routes, Route, Link } from 'react-router-dom'

// Importa cada tela (cada uma está em seu próprio arquivo, dentro de /pages).
import Home from './pages/Home'
import Planos from './pages/Planos'
import Pacientes from './pages/Pacientes'
import Dentistas from './pages/Dentistas'
import Procedimentos from './pages/Procedimentos'
import Agendamentos from './pages/Agendamentos'
import Consultas from './pages/Consultas'
import HistoricoClinico from './pages/HistoricoClinico'
import Pagamentos from './pages/Pagamentos'

function App() {
  return (
    <div>
      {/* Barra de navegação: cada <Link> leva para uma tela diferente
          (sem recarregar a página, graças ao react-router-dom). */}
      <nav className="navbar">
        <span className="titulo">🦷 Clínica Odontológica</span>
        <Link to="/">Início</Link>
        <Link to="/planos">Planos</Link>
        <Link to="/pacientes">Pacientes</Link>
        <Link to="/dentistas">Dentistas</Link>
        <Link to="/procedimentos">Procedimentos</Link>
        <Link to="/agendamentos">Agendamentos</Link>
        <Link to="/consultas">Consultas</Link>
        <Link to="/historico">Histórico</Link>
        <Link to="/pagamentos">Pagamentos</Link>
      </nav>

      {/* Área onde a tela escolhida é exibida. */}
      <main className="conteudo">
        {/* <Routes> escolhe qual componente mostrar conforme o endereço (path) da URL. */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/planos" element={<Planos />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/dentistas" element={<Dentistas />} />
          <Route path="/procedimentos" element={<Procedimentos />} />
          <Route path="/agendamentos" element={<Agendamentos />} />
          <Route path="/consultas" element={<Consultas />} />
          <Route path="/historico" element={<HistoricoClinico />} />
          <Route path="/pagamentos" element={<Pagamentos />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
