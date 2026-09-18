// ============================================================
//  cors.ts — Configuração de CORS
// ============================================================
// CORS é uma regra de segurança dos navegadores: por padrão, uma página rodando
// em um endereço (ex: o React em http://localhost:5173) NÃO pode chamar uma API
// em outro endereço (nossa API em http://localhost:8080).
//
// Como o frontend e o backend rodam em portas diferentes durante o desenvolvimento,
// precisamos "liberar" explicitamente o endereço do front. É isso que este arquivo faz.

import cors, { CorsOptions } from 'cors'

export const opcoesDeCors: CorsOptions = {
  // Libera as chamadas vindas do React em desenvolvimento.
  // O Create React App roda na 3000 por padrão, mas aqui mudamos a porta do
  // front para 5173 no arquivo frontend/.env (PORT=5173).
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',

  // Permite os métodos HTTP que usamos no CRUD.
  //
  // O PATCH é indispensável: é ele que usamos para atualizar cadastros, alterar
  // a situação de um usuário e confirmar um atendimento. Sem ele nesta lista, o
  // navegador barra a chamada ANTES de ela chegar na API (o erro aparece no
  // front como "Failed to fetch", sem nada no console do backend).
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  // Permite qualquer cabeçalho na requisição (ex: Content-Type: application/json).
  allowedHeaders: '*',
}

// Middleware pronto para ser usado no app do Express (ver src/index.ts).
export const configuracaoDeCors = cors(opcoesDeCors)
