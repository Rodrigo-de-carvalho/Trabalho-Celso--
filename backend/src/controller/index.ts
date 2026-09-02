// ============================================================
//  index.ts (controller) — Junta TODAS as rotas da API em um lugar só
// ============================================================
// Cada controller cuida de um recurso. Aqui montamos o "mapa" da API,
// dizendo qual endereço base leva a qual controller.
//
// Os nomes das rotas seguem o padrão sugerido no edital da AV3
// (/api/auth, /api/users, /api/psychologists, /api/patients, /api/audit-logs),
// acrescidos das duas rotas do nosso produto: /api/appointments (a agenda com
// confirmação, que é a funcionalidade inovadora) e /api/dashboard (indicadores).

import { Router } from 'express'

import { authController } from './AuthController'
import { usuarioController } from './UsuarioController'
import { psicologoController } from './PsicologoController'
import { clientePacienteController } from './ClientePacienteController'
import { atendimentoController } from './AtendimentoController'
import { painelController } from './PainelController'
import { logController } from './LogController'

export const rotasDaApi = Router()

// Única área pública: o login.
rotasDaApi.use('/auth', authController)

// Daqui para baixo, cada controller exige autenticação (e alguns, perfil
// específico) — a proteção é declarada dentro de cada um deles.
rotasDaApi.use('/users', usuarioController)
rotasDaApi.use('/psychologists', psicologoController)
rotasDaApi.use('/patients', clientePacienteController)
rotasDaApi.use('/appointments', atendimentoController)
rotasDaApi.use('/dashboard', painelController)
rotasDaApi.use('/audit-logs', logController)
