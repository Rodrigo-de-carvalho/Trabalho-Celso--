import { Router } from 'express'
import { painelService } from '../service/PainelService'
import { autenticar } from '../middleware/autenticacao'
import { rota } from './apoio'

/**
 * Controller do Painel (dashboard).
 *
 * Uma rota só, que devolve os indicadores certos para o perfil de quem chamou:
 * o administrador recebe a visão geral; o psicólogo, apenas os números dele.
 */
export const painelController = Router()

// GET /api/dashboard -> indicadores da tela inicial.
painelController.get(
  '/',
  autenticar,
  rota(async (req, res) => {
    res.json(await painelService.montarPainel(req.usuarioLogado!))
  })
)
