import { Router } from 'express'
import { pagamentoService } from '../service/PagamentoService'
import { lerIdDaUrl, rota } from './apoio'

/**
 * Controller dos Pagamentos. CRUD completo.
 * Cada pagamento é vinculado a uma consulta (ver PagamentoService).
 */
export const pagamentoController = Router()

// GET /api/pagamentos -> lista todos.
pagamentoController.get(
  '/',
  rota(async (_req, res) => {
    res.json(await pagamentoService.listarTodos())
  })
)

// GET /api/pagamentos/5 -> busca um registro específico pelo id.
pagamentoController.get(
  '/:id',
  rota(async (req, res) => {
    res.json(await pagamentoService.buscarPorId(lerIdDaUrl(req)))
  })
)

// POST /api/pagamentos -> cadastra um novo registro (retorna 201 CREATED).
// Ex: { "consulta": { "idConsulta": 1 }, "formaPagamento": "Pix", "valorPago": 150.00 }.
pagamentoController.post(
  '/',
  rota(async (req, res) => {
    res.status(201).json(await pagamentoService.criar(req.body))
  })
)

// PUT /api/pagamentos/5 -> atualiza o registro de id 5.
pagamentoController.put(
  '/:id',
  rota(async (req, res) => {
    res.json(await pagamentoService.atualizar(lerIdDaUrl(req), req.body))
  })
)

// DELETE /api/pagamentos/5 -> apaga o registro de id 5 (retorna 204 No Content).
pagamentoController.delete(
  '/:id',
  rota(async (req, res) => {
    await pagamentoService.deletar(lerIdDaUrl(req))
    res.status(204).send()
  })
)
