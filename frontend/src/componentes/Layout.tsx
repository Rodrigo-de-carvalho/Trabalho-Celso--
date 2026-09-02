// ============================================================
//  Layout.tsx — Moldura das telas internas (menu + cabeçalho)
// ============================================================
// O menu é montado de acordo com o perfil de quem está logado: o
// administrador vê os itens de gestão; o psicólogo vê a área dele.

import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAutenticacao } from '../contexto/Autenticacao'

export function Layout() {
  const { usuario, sair, temPerfil } = useAutenticacao()

  return (
    <div className="aplicacao">
      <header className="barra-superior">
        <Link to="/" className="marca">
          <span className="marca-icone" aria-hidden="true">
            🧠
          </span>
          PsiGestor
        </Link>

        <nav className="menu">
          <NavLink to="/">Painel</NavLink>

          {/* Itens exclusivos do administrador. */}
          {temPerfil('Administrador') && <NavLink to="/usuarios">Usuários</NavLink>}
          {temPerfil('Administrador') && <NavLink to="/psicologos">Psicólogos</NavLink>}

          <NavLink to="/pacientes">Clientes/Pacientes</NavLink>
          <NavLink to="/agenda">Agenda</NavLink>

          {temPerfil('Psicologo') && <NavLink to="/meu-perfil">Meu perfil</NavLink>}
          {temPerfil('Administrador') && <NavLink to="/auditoria">Auditoria</NavLink>}
        </nav>

        <div className="identificacao">
          <span className="nome-do-usuario">{usuario?.nomeCompleto}</span>
          <span className="etiqueta-perfil">{usuario?.perfil}</span>
          <button type="button" className="botao-secundario" onClick={sair}>
            Sair
          </button>
        </div>
      </header>

      {/* Aqui o react-router encaixa a tela escolhida no menu. */}
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  )
}
