// ============================================================
//  Autenticacao.tsx — Quem está logado, disponível em todas as telas
// ============================================================
// Um "contexto" do React é uma informação que fica disponível para todos os
// componentes sem precisar ir passando de tela em tela. Aqui guardamos o
// usuário logado, e é dele que cada tela descobre o que pode mostrar.
//
// IMPORTANTE: esconder um botão aqui é apenas conforto visual. Quem realmente
// impede uma operação indevida é o back-end — se alguém chamar a API por fora
// do site, a autorização continua valendo.

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import * as api from '../api'
import { NomeDePerfil, UsuarioLogado } from '../tipos'

interface ValorDoContexto {
  usuario: UsuarioLogado | null
  carregando: boolean
  entrar: (email: string, senha: string) => Promise<void>
  sair: () => Promise<void>
  /** Atalho para perguntar "o usuário logado é de algum destes perfis?". */
  temPerfil: (...perfis: NomeDePerfil[]) => boolean
}

const ContextoDeAutenticacao = createContext<ValorDoContexto | null>(null)

export function ProvedorDeAutenticacao({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null)
  const [carregando, setCarregando] = useState(true)

  // Ao abrir (ou recarregar) o site, conferimos com o servidor se o token
  // guardado no navegador ainda é válido. Isso evita mostrar as telas internas
  // para uma sessão que já expirou.
  useEffect(() => {
    async function conferir() {
      if (!api.lerToken()) {
        setCarregando(false)
        return
      }
      try {
        const dados = await api.conferirSessao()
        const salvo = localStorage.getItem('psigestor.usuario')
        const nomeSalvo = salvo ? (JSON.parse(salvo) as UsuarioLogado).nomeCompleto : dados.email
        setUsuario({
          idUsuario: dados.idUsuario,
          email: dados.email,
          perfil: dados.perfil,
          nomeCompleto: nomeSalvo,
        })
      } catch {
        // Token inválido/expirado: a própria api.ts já o apagou.
        api.apagarToken()
      } finally {
        setCarregando(false)
      }
    }
    conferir()
  }, [])

  async function entrar(email: string, senha: string) {
    const resposta = await api.entrar(email, senha)
    api.guardarToken(resposta.token)
    localStorage.setItem('psigestor.usuario', JSON.stringify(resposta.usuario))
    setUsuario(resposta.usuario)
  }

  async function sair() {
    try {
      // Avisamos o servidor para ele INVALIDAR o token de verdade — não basta
      // apagá-lo do navegador, senão uma cópia dele continuaria funcionando.
      await api.sair()
    } catch {
      // Se o servidor estiver fora do ar, ainda assim encerramos a sessão local.
    }
    api.apagarToken()
    localStorage.removeItem('psigestor.usuario')
    setUsuario(null)
  }

  function temPerfil(...perfis: NomeDePerfil[]) {
    return usuario !== null && perfis.includes(usuario.perfil)
  }

  return (
    <ContextoDeAutenticacao.Provider value={{ usuario, carregando, entrar, sair, temPerfil }}>
      {children}
    </ContextoDeAutenticacao.Provider>
  )
}

/** Atalho usado pelas telas: const { usuario } = useAutenticacao() */
export function useAutenticacao(): ValorDoContexto {
  const contexto = useContext(ContextoDeAutenticacao)
  if (!contexto) {
    throw new Error('useAutenticacao precisa estar dentro do ProvedorDeAutenticacao.')
  }
  return contexto
}
