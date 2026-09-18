// ============================================================
//  Testes da API: proteção das rotas e validação de entrada
// ============================================================
// Aqui subimos a API de verdade e fazemos chamadas HTTP nela. Estes testes
// NÃO dependem do MySQL: eles exercitam exatamente as camadas que barram a
// requisição ANTES de ela chegar ao banco (autenticação, autorização,
// validação de entrada e tratamento de erros).

import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'
import { Server } from 'node:http'

process.env.JWT_SECRET = 'segredo-usado-somente-nos-testes'

import { criarApp } from '../app'
import { gerarIdDeToken, gerarToken } from '../util/seguranca'

let servidor: Server
let base: string

before(async () => {
  // Porta 0 = o sistema operacional escolhe uma porta livre, então o teste
  // nunca briga com a API que já esteja rodando na 8080.
  await new Promise<void>((resolve) => {
    servidor = criarApp().listen(0, () => {
      const endereco = servidor.address()
      const porta = typeof endereco === 'object' && endereco ? endereco.port : 0
      base = `http://localhost:${porta}`
      resolve()
    })
  })
})

after(() => {
  servidor.close()
})

/** Lê o corpo JSON da resposta já com o formato que a nossa API sempre usa. */
async function corpoDe(resposta: Response): Promise<{ mensagem?: string }> {
  return (await resposta.json()) as { mensagem?: string }
}

/** Cria um token válido para o perfil informado (sem precisar do banco). */
function tokenDe(perfil: 'Administrador' | 'Psicologo' | 'Atendente') {
  return gerarToken({
    idUsuario: 99,
    email: 'teste@psigestor.com',
    perfil,
    jti: gerarIdDeToken(),
  })
}

const ROTAS_PROTEGIDAS = [
  '/api/users',
  '/api/psychologists',
  '/api/patients',
  '/api/appointments',
  '/api/dashboard',
  '/api/audit-logs',
]

test('nenhuma rota interna responde sem token (401)', async () => {
  for (const rota of ROTAS_PROTEGIDAS) {
    const resposta = await fetch(base + rota)
    assert.equal(resposta.status, 401, `a rota ${rota} deveria exigir login`)

    const corpo = await corpoDe(resposta)
    assert.ok(corpo.mensagem, `a rota ${rota} deveria explicar o motivo`)
  }
})

test('token inválido é recusado (401)', async () => {
  const resposta = await fetch(base + '/api/patients', {
    headers: { Authorization: 'Bearer isto-nao-e-um-token' },
  })
  assert.equal(resposta.status, 401)
})

test('psicólogo não acessa a área do administrador (403)', async () => {
  // Este é o teste da regra "a autorização é validada no back-end": mesmo com
  // um token perfeitamente válido, o perfil errado não passa.
  for (const rota of ['/api/users', '/api/audit-logs']) {
    const resposta = await fetch(base + rota, {
      headers: { Authorization: 'Bearer ' + tokenDe('Psicologo') },
    })
    assert.equal(resposta.status, 403, `a rota ${rota} deveria ser exclusiva do administrador`)
  }
})

test('login sem e-mail ou senha responde 400', async () => {
  const resposta = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@psigestor.com' }),
  })

  assert.equal(resposta.status, 400)
  const corpo = await corpoDe(resposta)
  assert.match(corpo.mensagem ?? '', /e-mail e a senha/i)
})

test('a resposta de erro nunca expõe detalhes internos', async () => {
  const resposta = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{ json quebrado',
  })

  assert.equal(resposta.status, 400)
  const texto = JSON.stringify(await corpoDe(resposta)).toLowerCase()
  // Nada de rastro de pilha, caminho de arquivo ou credencial na resposta.
  for (const proibido of ['senha', 'password', 'at object', '/home/', 'mysql']) {
    assert.ok(!texto.includes(proibido), `a resposta não deveria conter "${proibido}"`)
  }
})

test('rota inexistente responde 404 em JSON', async () => {
  const resposta = await fetch(base + '/api/rota-que-nao-existe', {
    headers: { Authorization: 'Bearer ' + tokenDe('Administrador') },
  })

  assert.equal(resposta.status, 404)
  assert.ok((await corpoDe(resposta)).mensagem)
})

test('id inválido no endereço responde 400', async () => {
  const resposta = await fetch(base + '/api/patients/abc', {
    headers: { Authorization: 'Bearer ' + tokenDe('Administrador') },
  })

  assert.equal(resposta.status, 400)
})

// ============================================================
//  CORS — os métodos que o front realmente usa precisam estar liberados
// ============================================================
// Este teste existe por causa de um bug real: o PATCH não estava na lista de
// métodos permitidos do CORS. As rotas funcionavam perfeitamente quando
// chamadas por fora do navegador, mas na tela o usuário só via
// "Failed to fetch" ao editar um cadastro ou confirmar um atendimento —
// e nada aparecia no console do backend, porque o navegador barrava a
// requisição na checagem prévia (preflight), antes de ela sair.

test('o CORS libera todos os métodos HTTP usados pelas rotas da API', async () => {
  for (const metodo of ['GET', 'POST', 'PATCH']) {
    const resposta = await fetch(base + '/api/patients/1', {
      method: 'OPTIONS',
      headers: {
        Origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
        'Access-Control-Request-Method': metodo,
      },
    })

    const permitidos = resposta.headers.get('access-control-allow-methods') ?? ''

    assert.ok(
      permitidos.split(',').map((m) => m.trim()).includes(metodo),
      `O método ${metodo} não está liberado no CORS (Allow-Methods: "${permitidos}"). ` +
        'O navegador vai barrar a chamada e o front mostra "Failed to fetch".'
    )
  }
})
