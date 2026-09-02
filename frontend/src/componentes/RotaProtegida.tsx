// ============================================================
//  RotaProtegida.tsx — O "porteiro" das telas internas
// ============================================================
// Envolve uma tela e só a exibe se o usuário estiver logado (e, quando
// indicado, se ele tiver o perfil certo). Quem não estiver logado é mandado
// para a tela de login.

import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAutenticacao } from '../contexto/Autenticacao'
import { NomeDePerfil } from '../tipos'

interface Props {
  children: ReactNode
  /** Se informado, apenas estes perfis conseguem abrir a tela. */
  perfis?: NomeDePerfil[]
}

export function RotaProtegida({ children, perfis }: Props) {
  const { usuario, carregando } = useAutenticacao()

  // Enquanto conferimos o token com o servidor, não decidimos nada: se
  // redirecionássemos agora, o usuário logado seria jogado para o login a cada F5.
  if (carregando) {
    return <p className="carregando">Carregando…</p>
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (perfis && !perfis.includes(usuario.perfil)) {
    return (
      <div className="cartao">
        <h1>Acesso negado</h1>
        <p className="aviso-erro">
          O seu perfil ({usuario.perfil}) não tem permissão para acessar esta página.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
