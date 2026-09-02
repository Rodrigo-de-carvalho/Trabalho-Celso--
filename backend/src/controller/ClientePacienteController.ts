import { Router } from 'express'
import { clientePacienteService } from '../service/ClientePacienteService'
import { PERFIL } from '../entity/Perfil'
import { autenticar, autorizar } from '../middleware/autenticacao'
import { lerIdDaUrl, rota, textoDaQuery } from './apoio'

/**
 * Controller dos Clientes/Pacientes.
 *
 * Todas as rotas exigem login. O filtro de QUAIS registros cada pessoa enxerga
 * fica no service (que consulta os vínculos) — aqui só garantimos que ninguém
 * entra sem estar autenticado.
 */
export const clientePacienteController = Router()

clientePacienteController.use(autenticar)

// GET /api/patients?termo=ana&situacao=Ativo -> lista os autorizados.
clientePacienteController.get(
  '/',
  rota(async (req, res) => {
    res.json(
      await clientePacienteService.listar(req.usuarioLogado!, {
        termo: textoDaQuery(req, 'termo'),
        situacao: textoDaQuery(req, 'situacao'),
      })
    )
  })
)

// GET /api/patients/5 -> consulta um registro autorizado.
clientePacienteController.get(
  '/:id',
  rota(async (req, res) => {
    res.json(await clientePacienteService.buscarPorId(lerIdDaUrl(req), req.usuarioLogado!))
  })
)

// POST /api/patients -> cadastra um cliente/paciente (retorna 201 CREATED).
clientePacienteController.post(
  '/',
  rota(async (req, res) => {
    res.status(201).json(await clientePacienteService.criar(req.body, req.usuarioLogado!))
  })
)

// PATCH /api/patients/5 -> atualiza um registro autorizado (inclusive ativar/inativar).
// Não existe DELETE: pelo edital, preferimos inativar a apagar, para não
// perder o histórico de atendimentos daquela pessoa.
clientePacienteController.patch(
  '/:id',
  rota(async (req, res) => {
    res.json(
      await clientePacienteService.atualizar(lerIdDaUrl(req), req.body, req.usuarioLogado!)
    )
  })
)

// ---------------- VÍNCULOS (administrador) ----------------

// GET /api/patients/vinculos/psicologo/3 -> quem o psicólogo 3 atende.
clientePacienteController.get(
  '/vinculos/psicologo/:idPsicologo',
  autorizar(PERFIL.ADMINISTRADOR),
  rota(async (req, res) => {
    res.json(
      await clientePacienteService.listarVinculosDoPsicologo(lerIdDaUrl(req, 'idPsicologo'))
    )
  })
)

// POST /api/patients/vinculos -> liga um paciente a um psicólogo.
// Ex: { "psicologo": { "idPsicologo": 1 }, "cliente": { "idCliente": 4 } }
clientePacienteController.post(
  '/vinculos',
  autorizar(PERFIL.ADMINISTRADOR),
  rota(async (req, res) => {
    res.status(201).json(await clientePacienteService.vincular(req.body, req.usuarioLogado!))
  })
)

// PATCH /api/patients/vinculos/7/encerrar -> encerra o vínculo (não apaga).
clientePacienteController.patch(
  '/vinculos/:idVinculo/encerrar',
  autorizar(PERFIL.ADMINISTRADOR),
  rota(async (req, res) => {
    res.json(
      await clientePacienteService.encerrarVinculo(
        lerIdDaUrl(req, 'idVinculo'),
        req.usuarioLogado!
      )
    )
  })
)
