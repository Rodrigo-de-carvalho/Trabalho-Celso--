import { Router } from 'express'
import { planoOdontologicoService } from '../service/PlanoOdontologicoService'
import { lerIdDaUrl, rota } from './apoio'

/**
 * Controller dos Planos Odontológicos.
 *
 * O controller é a "porta de entrada" da API: ele recebe a requisição HTTP,
 * chama o service (que tem as regras) e devolve a resposta em JSON.
 * Um Router do Express agrupa as rotas de um mesmo recurso.
 */
export const planoOdontologicoController = Router()

// GET /api/planos -> lista todos os planos.
planoOdontologicoController.get(
  '/',
  rota(async (_req, res) => {
    res.json(await planoOdontologicoService.listarTodos())
  })
)

// GET /api/planos/5 -> busca um plano específico. req.params.id pega o "5" da URL.
planoOdontologicoController.get(
  '/:id',
  rota(async (req, res) => {
    res.json(await planoOdontologicoService.buscarPorId(lerIdDaUrl(req)))
  })
)

// POST /api/planos -> cadastra um plano novo. req.body é o JSON recebido.
// Status 201 (Created) = criado com sucesso.
planoOdontologicoController.post(
  '/',
  rota(async (req, res) => {
    res.status(201).json(await planoOdontologicoService.criar(req.body))
  })
)

// PUT /api/planos/5 -> atualiza o plano de id 5.
planoOdontologicoController.put(
  '/:id',
  rota(async (req, res) => {
    res.json(await planoOdontologicoService.atualizar(lerIdDaUrl(req), req.body))
  })
)

// DELETE /api/planos/5 -> apaga o plano de id 5.
// Status 204 (No Content) = apagado com sucesso, sem corpo na resposta.
planoOdontologicoController.delete(
  '/:id',
  rota(async (req, res) => {
    await planoOdontologicoService.deletar(lerIdDaUrl(req))
    res.status(204).send()
  })
)
