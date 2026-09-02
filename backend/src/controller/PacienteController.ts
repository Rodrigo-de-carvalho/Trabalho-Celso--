import { Router } from 'express'
import { pacienteService } from '../service/PacienteService'
import { lerIdDaUrl, rota } from './apoio'

/**
 * Controller dos Pacientes.
 * Expõe o CRUD completo e também uma busca por nome/CPF.
 */
export const pacienteController = Router()

// GET /api/pacientes -> lista todos os pacientes.
pacienteController.get(
  '/',
  rota(async (_req, res) => {
    res.json(await pacienteService.listarTodos())
  })
)

// GET /api/pacientes/buscar?termo=joao -> busca por nome OU CPF.
// req.query pega o valor que vem depois do "?" na URL (termo=joao).
// ATENÇÃO: esta rota vem ANTES de "/:id", senão o Express entenderia
// "buscar" como se fosse um id.
pacienteController.get(
  '/buscar',
  rota(async (req, res) => {
    const termo = typeof req.query.termo === 'string' ? req.query.termo : ''
    res.json(await pacienteService.buscar(termo))
  })
)

// GET /api/pacientes/5 -> busca um paciente específico.
pacienteController.get(
  '/:id',
  rota(async (req, res) => {
    res.json(await pacienteService.buscarPorId(lerIdDaUrl(req)))
  })
)

// POST /api/pacientes -> cadastra um novo paciente (retorna 201 CREATED).
pacienteController.post(
  '/',
  rota(async (req, res) => {
    res.status(201).json(await pacienteService.criar(req.body))
  })
)

// PUT /api/pacientes/5 -> atualiza o paciente de id 5.
pacienteController.put(
  '/:id',
  rota(async (req, res) => {
    res.json(await pacienteService.atualizar(lerIdDaUrl(req), req.body))
  })
)

// DELETE /api/pacientes/5 -> apaga o paciente de id 5 (retorna 204 No Content).
pacienteController.delete(
  '/:id',
  rota(async (req, res) => {
    await pacienteService.deletar(lerIdDaUrl(req))
    res.status(204).send()
  })
)
