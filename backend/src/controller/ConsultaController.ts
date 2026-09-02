import { Router } from 'express'
import { consultaService } from '../service/ConsultaService'
import { lerIdDaUrl, rota } from './apoio'

/**
 * Controller das Consultas. CRUD completo.
 * O valorTotal NÃO é enviado pelo frontend: quem calcula é o ConsultaService.
 */
export const consultaController = Router()

// GET /api/consultas -> lista todos.
consultaController.get(
  '/',
  rota(async (_req, res) => {
    res.json(await consultaService.listarTodos())
  })
)

// GET /api/consultas/5 -> busca um registro específico pelo id.
consultaController.get(
  '/:id',
  rota(async (req, res) => {
    res.json(await consultaService.buscarPorId(lerIdDaUrl(req)))
  })
)

// POST /api/consultas -> cadastra um novo registro (retorna 201 CREATED).
// Ex: { "agendamento": { "idAgendamento": 1 }, "observacoes": "Paciente relatou sensibilidade." }.
consultaController.post(
  '/',
  rota(async (req, res) => {
    res.status(201).json(await consultaService.criar(req.body))
  })
)

// PUT /api/consultas/5 -> atualiza o registro de id 5.
consultaController.put(
  '/:id',
  rota(async (req, res) => {
    res.json(await consultaService.atualizar(lerIdDaUrl(req), req.body))
  })
)

// DELETE /api/consultas/5 -> apaga o registro de id 5 (retorna 204 No Content).
consultaController.delete(
  '/:id',
  rota(async (req, res) => {
    await consultaService.deletar(lerIdDaUrl(req))
    res.status(204).send()
  })
)
