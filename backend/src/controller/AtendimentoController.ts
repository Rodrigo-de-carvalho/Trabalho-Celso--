import { Router } from 'express'
import { atendimentoService } from '../service/AtendimentoService'
import { autenticar } from '../middleware/autenticacao'
import { lerIdDaUrl, rota } from './apoio'

/**
 * Controller dos Atendimentos — a agenda com confirmação (FUNCIONALIDADE INOVADORA).
 *
 * O psicólogo enxerga e mexe apenas na própria agenda; administrador e
 * atendente enxergam a agenda de toda a clínica. Quem decide isso é o service.
 */
export const atendimentoController = Router()

atendimentoController.use(autenticar)

// GET /api/appointments -> lista os atendimentos autorizados.
atendimentoController.get(
  '/',
  rota(async (req, res) => {
    res.json(await atendimentoService.listar(req.usuarioLogado!))
  })
)

// GET /api/appointments/5 -> consulta um atendimento autorizado.
atendimentoController.get(
  '/:id',
  rota(async (req, res) => {
    res.json(await atendimentoService.buscarPorId(lerIdDaUrl(req), req.usuarioLogado!))
  })
)

// POST /api/appointments -> agenda um atendimento (retorna 201 CREATED).
// Ex: { "cliente": { "idCliente": 1 }, "dataHora": "2026-09-20T09:00", "modalidade": "Online" }
atendimentoController.post(
  '/',
  rota(async (req, res) => {
    res.status(201).json(await atendimentoService.criar(req.body, req.usuarioLogado!))
  })
)

// PATCH /api/appointments/5/confirmar -> confirma a presença.
// É o passo central da inovação, por isso ganhou uma rota própria: fica claro
// no código e na auditoria que a confirmação aconteceu.
atendimentoController.patch(
  '/:id/confirmar',
  rota(async (req, res) => {
    res.json(await atendimentoService.confirmar(lerIdDaUrl(req), req.usuarioLogado!))
  })
)

// PATCH /api/appointments/5 -> muda status, remarca ou edita observações.
atendimentoController.patch(
  '/:id',
  rota(async (req, res) => {
    res.json(await atendimentoService.atualizar(lerIdDaUrl(req), req.body, req.usuarioLogado!))
  })
)
