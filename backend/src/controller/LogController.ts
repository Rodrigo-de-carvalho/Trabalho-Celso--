import { Router } from 'express'
import { logService } from '../service/LogService'
import { PERFIL } from '../entity/Perfil'
import { autenticar, autorizar } from '../middleware/autenticacao'
import { rota, textoDaQuery } from './apoio'

/**
 * Controller da auditoria — consulta exclusiva do administrador.
 *
 * Só existe rota de LEITURA: o edital determina que nem o administrador pode
 * remover registros de auditoria, então não há POST, PATCH nem DELETE aqui.
 */
export const logController = Router()

// GET /api/audit-logs?limite=100 -> lista as ações mais recentes.
logController.get(
  '/',
  autenticar,
  autorizar(PERFIL.ADMINISTRADOR),
  rota(async (req, res) => {
    const limite = Number(textoDaQuery(req, 'limite') ?? 200)
    res.json(await logService.listar(Number.isNaN(limite) ? 200 : limite))
  })
)
