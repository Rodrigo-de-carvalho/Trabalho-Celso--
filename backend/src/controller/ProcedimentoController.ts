import { Router } from 'express'
import { procedimentoService } from '../service/ProcedimentoService'
import { lerIdDaUrl, rota } from './apoio'

/**
 * Controller dos Procedimentos. CRUD completo.
 * O valor cadastrado aqui é a base do cálculo do valor da consulta.
 */
export const procedimentoController = Router()

// GET /api/procedimentos -> lista todos.
procedimentoController.get(
  '/',
  rota(async (_req, res) => {
    res.json(await procedimentoService.listarTodos())
  })
)

// GET /api/procedimentos/5 -> busca um registro específico pelo id.
procedimentoController.get(
  '/:id',
  rota(async (req, res) => {
    res.json(await procedimentoService.buscarPorId(lerIdDaUrl(req)))
  })
)

// POST /api/procedimentos -> cadastra um novo registro (retorna 201 CREATED).
// Ex: { "nome": "Limpeza", "valor": 150.00, "tempoEstimado": 40 }.
procedimentoController.post(
  '/',
  rota(async (req, res) => {
    res.status(201).json(await procedimentoService.criar(req.body))
  })
)

// PUT /api/procedimentos/5 -> atualiza o registro de id 5.
procedimentoController.put(
  '/:id',
  rota(async (req, res) => {
    res.json(await procedimentoService.atualizar(lerIdDaUrl(req), req.body))
  })
)

// DELETE /api/procedimentos/5 -> apaga o registro de id 5 (retorna 204 No Content).
procedimentoController.delete(
  '/:id',
  rota(async (req, res) => {
    await procedimentoService.deletar(lerIdDaUrl(req))
    res.status(204).send()
  })
)
