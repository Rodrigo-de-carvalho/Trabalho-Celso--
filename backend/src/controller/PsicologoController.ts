import { Router } from 'express'
import { psicologoService } from '../service/PsicologoService'
import { PERFIL } from '../entity/Perfil'
import { autenticar, autorizar } from '../middleware/autenticacao'
import { lerIdDaUrl, rota } from './apoio'

/**
 * Controller dos Psicólogos.
 *
 * Consultar a lista é liberado para qualquer usuário autenticado (o atendente
 * precisa dela para agendar). Cadastrar é operação de administrador. Editar é
 * permitido ao administrador e ao próprio psicólogo — essa checagem depende de
 * QUAL registro está sendo editado, então acontece dentro do service.
 */
export const psicologoController = Router()

psicologoController.use(autenticar)

// GET /api/psychologists -> lista os psicólogos.
psicologoController.get(
  '/',
  rota(async (_req, res) => {
    res.json(await psicologoService.listarTodos())
  })
)

// GET /api/psychologists/eu -> o cadastro do psicólogo que está logado.
// Vem ANTES de "/:id" para o Express não entender "eu" como um id.
psicologoController.get(
  '/eu',
  autorizar(PERFIL.PSICOLOGO),
  rota(async (req, res) => {
    res.json(await psicologoService.buscarPeloUsuarioLogado(req.usuarioLogado!))
  })
)

// GET /api/psychologists/3 -> consulta um psicólogo.
psicologoController.get(
  '/:id',
  rota(async (req, res) => {
    res.json(await psicologoService.buscarPorId(lerIdDaUrl(req)))
  })
)

// POST /api/psychologists -> cadastra o profissional (somente administrador).
// Ex: { "usuario": { "idUsuario": 2 }, "crp": "CRP 03/11111", "areaAtuacao": "Clínica" }
psicologoController.post(
  '/',
  autorizar(PERFIL.ADMINISTRADOR),
  rota(async (req, res) => {
    res.status(201).json(await psicologoService.criar(req.body, req.usuarioLogado!.idUsuario))
  })
)

// PATCH /api/psychologists/3 -> atualiza os dados profissionais.
psicologoController.patch(
  '/:id',
  rota(async (req, res) => {
    res.json(await psicologoService.atualizar(lerIdDaUrl(req), req.body, req.usuarioLogado!))
  })
)
