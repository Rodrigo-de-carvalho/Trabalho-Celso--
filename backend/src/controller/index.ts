// ============================================================
//  index.ts (controller) — Junta TODAS as rotas da API em um lugar só
// ============================================================
// Cada controller cuida de um recurso. Aqui montamos o "mapa" da API,
// dizendo qual endereço base leva a qual controller.

import { Router } from 'express'

import { planoOdontologicoController } from './PlanoOdontologicoController'
import { pacienteController } from './PacienteController'
import { dentistaController } from './DentistaController'
import { procedimentoController } from './ProcedimentoController'
import { agendamentoController } from './AgendamentoController'
import { consultaController } from './ConsultaController'
import { pagamentoController } from './PagamentoController'
import { historicoClinicoController } from './HistoricoClinicoController'
import { agendaController } from './AgendaController'

export const rotasDaApi = Router()

rotasDaApi.use('/planos', planoOdontologicoController)
rotasDaApi.use('/pacientes', pacienteController)
rotasDaApi.use('/dentistas', dentistaController)
rotasDaApi.use('/procedimentos', procedimentoController)
rotasDaApi.use('/agendamentos', agendamentoController)
rotasDaApi.use('/consultas', consultaController)
rotasDaApi.use('/pagamentos', pagamentoController)
rotasDaApi.use('/historicos', historicoClinicoController)
rotasDaApi.use('/agendas', agendaController)
