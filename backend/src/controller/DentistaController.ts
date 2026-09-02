import { Router } from 'express'
import { dentistaService } from '../service/DentistaService'
import { lerIdDaUrl, rota } from './apoio'

/**
 * Controller dos Dentistas. CRUD completo.
 * O CRO e o e-mail são validados como únicos pelo DentistaService.
 */
export const dentistaController = Router()

// GET /api/dentistas -> lista todos.
dentistaController.get(
  '/',
  rota(async (_req, res) => {
    res.json(await dentistaService.listarTodos())
  })
)

// GET /api/dentistas/5 -> busca um registro específico pelo id.
dentistaController.get(
  '/:id',
  rota(async (req, res) => {
    res.json(await dentistaService.buscarPorId(lerIdDaUrl(req)))
  })
)

// POST /api/dentistas -> cadastra um novo registro (retorna 201 CREATED).
// Ex: { "nomeCompleto": "Ana Lima", "cro": "CRO-SP 12345", "telefone": "11999990000", "email": "ana@clinica.com" }.
dentistaController.post(
  '/',
  rota(async (req, res) => {
    res.status(201).json(await dentistaService.criar(req.body))
  })
)

// PUT /api/dentistas/5 -> atualiza o registro de id 5.
dentistaController.put(
  '/:id',
  rota(async (req, res) => {
    res.json(await dentistaService.atualizar(lerIdDaUrl(req), req.body))
  })
)

// DELETE /api/dentistas/5 -> apaga o registro de id 5 (retorna 204 No Content).
dentistaController.delete(
  '/:id',
  rota(async (req, res) => {
    await dentistaService.deletar(lerIdDaUrl(req))
    res.status(204).send()
  })
)
