import { Router } from 'express'
import { agendamentoService } from '../service/AgendamentoService'
import { lerIdDaUrl, rota } from './apoio'

/**
 * Controller dos Agendamentos. CRUD completo.
 * O AgendamentoService impede dois agendamentos do mesmo dentista no mesmo horário (409).
 */
export const agendamentoController = Router()

// GET /api/agendamentos -> lista todos.
agendamentoController.get(
  '/',
  rota(async (_req, res) => {
    res.json(await agendamentoService.listarTodos())
  })
)

// GET /api/agendamentos/5 -> busca um registro específico pelo id.
agendamentoController.get(
  '/:id',
  rota(async (req, res) => {
    res.json(await agendamentoService.buscarPorId(lerIdDaUrl(req)))
  })
)

// POST /api/agendamentos -> cadastra um novo registro (retorna 201 CREATED).
// Ex: { "paciente": { "idPaciente": 1 }, "dentista": { "idDentista": 1 },
//        "procedimento": { "idProcedimento": 1 }, "dataHora": "2026-03-10T14:00" }.
agendamentoController.post(
  '/',
  rota(async (req, res) => {
    res.status(201).json(await agendamentoService.criar(req.body))
  })
)

// PUT /api/agendamentos/5 -> atualiza o registro de id 5.
agendamentoController.put(
  '/:id',
  rota(async (req, res) => {
    res.json(await agendamentoService.atualizar(lerIdDaUrl(req), req.body))
  })
)

// DELETE /api/agendamentos/5 -> apaga o registro de id 5 (retorna 204 No Content).
agendamentoController.delete(
  '/:id',
  rota(async (req, res) => {
    await agendamentoService.deletar(lerIdDaUrl(req))
    res.status(204).send()
  })
)
