import { Router } from 'express'
import { historicoClinicoService } from '../service/HistoricoClinicoService'
import { RequisicaoInvalidaError } from '../error/erros'
import { lerIdDaUrl, rota } from './apoio'

/**
 * Controller dos Históricos Clínicos. CRUD completo.
 * Tem também um endpoint extra para listar o histórico de UM paciente.
 */
export const historicoClinicoController = Router()

// GET /api/historicos -> lista todos os históricos.
historicoClinicoController.get(
  '/',
  rota(async (_req, res) => {
    res.json(await historicoClinicoService.listarTodos())
  })
)

// GET /api/historicos/paciente/3 -> lista os históricos do paciente de id 3.
// Esta rota vem ANTES de "/:id" para o Express não confundir "paciente" com um id.
historicoClinicoController.get(
  '/paciente/:idPaciente',
  rota(async (req, res) => {
    const idPaciente = Number(req.params.idPaciente)
    if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
      throw new RequisicaoInvalidaError('O id do paciente deve ser um número inteiro.')
    }
    res.json(await historicoClinicoService.listarPorPaciente(idPaciente))
  })
)

// GET /api/historicos/5 -> busca um histórico específico.
historicoClinicoController.get(
  '/:id',
  rota(async (req, res) => {
    res.json(await historicoClinicoService.buscarPorId(lerIdDaUrl(req)))
  })
)

// POST /api/historicos -> cadastra um histórico (retorna 201 CREATED).
// Ex: { "paciente": { "idPaciente": 1 }, "alergias": "Dipirona" }.
historicoClinicoController.post(
  '/',
  rota(async (req, res) => {
    res.status(201).json(await historicoClinicoService.criar(req.body))
  })
)

// PUT /api/historicos/5 -> atualiza o histórico de id 5.
historicoClinicoController.put(
  '/:id',
  rota(async (req, res) => {
    res.json(await historicoClinicoService.atualizar(lerIdDaUrl(req), req.body))
  })
)

// DELETE /api/historicos/5 -> apaga o histórico de id 5 (retorna 204 No Content).
historicoClinicoController.delete(
  '/:id',
  rota(async (req, res) => {
    await historicoClinicoService.deletar(lerIdDaUrl(req))
    res.status(204).send()
  })
)
