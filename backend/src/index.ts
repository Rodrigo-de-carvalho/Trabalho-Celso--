// ============================================================
//  index.ts — Ponto de partida da aplicação
// ============================================================
// É o primeiro arquivo que roda quando executamos "npm run dev" (ou "npm start").
// Ele faz duas coisas, nesta ordem:
//   1) conecta no banco de dados;
//   2) sobe o servidor da API na porta configurada.

import 'reflect-metadata' // precisa ser o PRIMEIRO import (os decoradores dependem dele)
import { AppDataSource } from './config/data-source'
import { criarApp } from './app'

const PORTA = Number(process.env.PORT ?? 8080)

async function iniciar() {
  try {
    // Conecta no MySQL usando a configuração de config/data-source.ts.
    // O "await" espera a conexão terminar antes de continuar: não adianta subir
    // a API se o banco não estiver acessível.
    await AppDataSource.initialize()
    console.log('✅ Conectado ao banco de dados MySQL (clinica_odontologica).')

    // Com o banco de pé, montamos e ligamos o servidor web.
    const app = criarApp()
    app.listen(PORTA, () => {
      console.log(`🦷 API da Clínica Odontológica rodando em http://localhost:${PORTA}/api`)
    })
  } catch (erro) {
    // Erro mais comum aqui: usuário/senha do MySQL errados no arquivo .env,
    // ou o banco "clinica_odontologica" ainda não foi criado com o schema.sql.
    console.error('❌ Não foi possível iniciar a aplicação:', erro)
    process.exit(1)
  }
}

iniciar()
