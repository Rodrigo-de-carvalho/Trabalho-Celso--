// ============================================================
//  Login.tsx — Porta de entrada do sistema
// ============================================================

import { FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAutenticacao } from '../contexto/Autenticacao'
import { Erro } from '../componentes/Mensagens'

export function Login() {
  const { usuario, entrar, carregando } = useAutenticacao()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Quem já está logado não precisa ver esta tela.
  if (carregando) return <p className="carregando">Carregando…</p>
  if (usuario) return <Navigate to="/" replace />

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await entrar(email, senha)
    } catch (e) {
      // A API responde a mesma mensagem para e-mail inexistente e senha errada,
      // de propósito: assim ninguém descobre quais e-mails têm conta aqui.
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="tela-de-login">
      <form className="cartao cartao-login" onSubmit={enviar}>
        <div className="marca-login">
          <span aria-hidden="true">🧠</span>
          <h1>PsiGestor</h1>
        </div>
        <p className="subtitulo">Plataforma de gestão para profissionais de Psicologia</p>

        <Erro texto={erro} />

        <div className="campo">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            /* type="password" esconde o que é digitado. A senha vai para a API
               e nunca mais volta: o servidor guarda apenas o hash dela. */
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="botao-primario" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>

        <p className="dica-de-acesso">
          Acessos de demonstração (dados fictícios):
          <br />
          <code>admin@psigestor.com</code> / <code>admin123</code>
          <br />
          <code>bruno@psigestor.com</code> / <code>psi123</code>
        </p>
      </form>
    </div>
  )
}
