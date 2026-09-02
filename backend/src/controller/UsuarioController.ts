import { Router } from 'express'
import { usuarioService } from '../service/UsuarioService'
import { perfilRepository } from '../repository/repositories'
import { PERFIL } from '../entity/Perfil'
import { autenticar, autorizar } from '../middleware/autenticacao'
import { lerIdDaUrl, rota, textoDaQuery } from './apoio'

/**
 * Controller dos Usuários — área exclusiva do administrador.
 *
 * Repare que o autorizar(PERFIL.ADMINISTRADOR) está aplicado ao router INTEIRO:
 * qualquer rota adicionada aqui já nasce protegida, sem depender de alguém
 * lembrar de proteger cada uma.
 */
export const usuarioController = Router()

usuarioController.use(autenticar, autorizar(PERFIL.ADMINISTRADOR))

// GET /api/users?situacao=Ativo&termo=marina -> lista os usuários.
usuarioController.get(
  '/',
  rota(async (req, res) => {
    res.json(
      await usuarioService.listar({
        situacao: textoDaQuery(req, 'situacao'),
        termo: textoDaQuery(req, 'termo'),
      })
    )
  })
)

// GET /api/users/perfis -> lista os perfis para preencher o dropdown do formulário.
// Vem ANTES de "/:id" para o Express não entender "perfis" como um id.
usuarioController.get(
  '/perfis',
  rota(async (_req, res) => {
    res.json(await perfilRepository.find())
  })
)

// GET /api/users/5 -> consulta um usuário.
usuarioController.get(
  '/:id',
  rota(async (req, res) => {
    res.json(await usuarioService.buscarPorId(lerIdDaUrl(req)))
  })
)

// POST /api/users -> cadastra um usuário (retorna 201 CREATED).
// Ex: { "nomeCompleto": "...", "email": "...", "senha": "...", "perfil": { "idPerfil": 2 } }
usuarioController.post(
  '/',
  rota(async (req, res) => {
    res.status(201).json(await usuarioService.criar(req.body, req.usuarioLogado!.idUsuario))
  })
)

// PATCH /api/users/5 -> atualiza dados, perfil ou situação (ativar/bloquear/liberar).
// Usamos PATCH porque a atualização é PARCIAL: o front manda só o que mudou.
usuarioController.patch(
  '/:id',
  rota(async (req, res) => {
    res.json(
      await usuarioService.atualizar(lerIdDaUrl(req), req.body, req.usuarioLogado!.idUsuario)
    )
  })
)
