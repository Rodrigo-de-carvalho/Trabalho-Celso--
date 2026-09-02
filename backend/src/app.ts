// ============================================================
//  app.ts — Montagem da aplicação Express (a API em si)
// ============================================================
// Separamos a montagem do app do arquivo que o liga (index.ts). Assim fica claro
// qual é a "receita" da API: quais middlewares ela usa e em que ordem.
//
// A ORDEM importa muito no Express: cada requisição passa pelos middlewares de
// cima para baixo, então o tratador de erros tem que ser sempre o último.

import express from 'express'
import { configuracaoDeCors } from './config/cors'
import { rotasDaApi } from './controller'
import { rotaNaoEncontrada, tratadorDeErros } from './error/tratador-de-erros'

export function criarApp() {
  const app = express()

  // 1) Libera o frontend a chamar a API (regra de CORS).
  app.use(configuracaoDeCors)

  // 2) Lê o corpo das requisições em JSON e transforma em objeto (req.body).
  app.use(express.json())

  // 3) Todas as rotas do sistema ficam abaixo de /api
  //    (ex: /api/pacientes, /api/agendamentos...).
  app.use('/api', rotasDaApi)

  // 4) Se nenhuma rota acima respondeu, o endereço não existe -> 404.
  app.use(rotaNaoEncontrada)

  // 5) Tratador global de erros: SEMPRE por último.
  app.use(tratadorDeErros)

  return app
}
