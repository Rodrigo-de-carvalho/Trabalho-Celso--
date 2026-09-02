import { Router } from 'express'
import { agendaService } from '../service/AgendaService'
import { RequisicaoInvalidaError } from '../error/erros'
import { lerIdDaUrl, rota } from './apoio'

/**
 * Controller das Agendas (blocos de horário de trabalho). CRUD completo.
 * Tem também um endpoint extra para listar os horários de UM dentista.
 */
export const agendaController = Router()

// GET /api/agendas -> lista todos os blocos de horário.
agendaController.get(
  '/',
  rota(async (_req, res) => {
    res.json(await agendaService.listarTodos())
  })
)

// GET /api/agendas/dentista/2 -> lista os horários do dentista de id 2.
// Esta rota vem ANTES de "/:id" para o Express não confundir "dentista" com um id.
agendaController.get(
  '/dentista/:idDentista',
  rota(async (req, res) => {
    const idDentista = Number(req.params.idDentista)
    if (!Number.isInteger(idDentista) || idDentista <= 0) {
      throw new RequisicaoInvalidaError('O id do dentista deve ser um número inteiro.')
    }
    res.json(await agendaService.listarPorDentista(idDentista))
  })
)

// GET /api/agendas/5 -> busca um bloco de horário específico.
agendaController.get(
  '/:id',
  rota(async (req, res) => {
    res.json(await agendaService.buscarPorId(lerIdDaUrl(req)))
  })
)

// POST /api/agendas -> cadastra um bloco de horário (retorna 201 CREATED).
// Ex: { "dentista": { "idDentista": 1 }, "data": "2026-03-10", "horaInicio": "09:00", "horaFim": "12:00" }.
agendaController.post(
  '/',
  rota(async (req, res) => {
    res.status(201).json(await agendaService.criar(req.body))
  })
)

// PUT /api/agendas/5 -> atualiza o bloco de horário de id 5.
agendaController.put(
  '/:id',
  rota(async (req, res) => {
    res.json(await agendaService.atualizar(lerIdDaUrl(req), req.body))
  })
)

// DELETE /api/agendas/5 -> apaga o bloco de horário de id 5 (retorna 204 No Content).
agendaController.delete(
  '/:id',
  rota(async (req, res) => {
    await agendaService.deletar(lerIdDaUrl(req))
    res.status(204).send()
  })
)
