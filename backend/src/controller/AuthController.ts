import { Router } from 'express'
import { authService } from '../service/AuthService'
import { autenticar } from '../middleware/autenticacao'
import { rota } from './apoio'

/**
 * Controller de autenticação — a porta de entrada do sistema.
 *
 * É o ÚNICO controller com rotas públicas (o login). Todo o resto da API exige
 * um token válido.
 */
export const authController = Router()

// POST /api/auth/login -> troca e-mail + senha por um token de acesso.
// Ex: { "email": "admin@psigestor.com", "senha": "admin123" }
authController.post(
  '/login',
  rota(async (req, res) => {
    res.json(await authService.login(req.body))
  })
)

// POST /api/auth/logout -> invalida o token atual.
// Precisa estar autenticado: é o token enviado que será encerrado.
authController.post(
  '/logout',
  autenticar,
  rota(async (req, res) => {
    await authService.logout(req.usuarioLogado!)
    res.json({ mensagem: 'Sessão encerrada com sucesso.' })
  })
)

// GET /api/auth/eu -> devolve quem está logado.
// O frontend usa esta rota ao recarregar a página, para saber se o token que
// ele guardou ainda vale e qual painel deve abrir.
authController.get(
  '/eu',
  autenticar,
  rota(async (req, res) => {
    const { idUsuario, email, perfil } = req.usuarioLogado!
    res.json({ idUsuario, email, perfil })
  })
)
