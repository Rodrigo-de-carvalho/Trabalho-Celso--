// ============================================================
//  Testes de segurança: hash de senha e token de login
// ============================================================
// Estes são os testes mais importantes do projeto: eles provam que as duas
// regras de segurança exigidas no edital realmente funcionam.

import test from 'node:test'
import assert from 'node:assert/strict'

// O segredo precisa existir ANTES de qualquer geração de token.
process.env.JWT_SECRET = 'segredo-usado-somente-nos-testes'

import {
  conferirSenha,
  gerarHashDaSenha,
  gerarIdDeToken,
  gerarToken,
  lerToken,
} from '../util/seguranca'

test('a senha nunca é guardada em texto puro', async () => {
  const senha = 'minhaSenha123'
  const hash = await gerarHashDaSenha(senha)

  // O hash não pode conter a senha original em lugar nenhum.
  assert.notEqual(hash, senha)
  assert.ok(!hash.includes(senha))
  // Formato de um hash bcrypt: começa com $2 e tem 60 caracteres.
  assert.ok(hash.startsWith('$2'))
  assert.equal(hash.length, 60)
})

test('a senha correta é aceita e a errada é recusada', async () => {
  const hash = await gerarHashDaSenha('minhaSenha123')

  assert.equal(await conferirSenha('minhaSenha123', hash), true)
  assert.equal(await conferirSenha('minhaSenha124', hash), false)
  assert.equal(await conferirSenha('', hash), false)
})

test('dois hashes da mesma senha são diferentes entre si', async () => {
  // O bcrypt adiciona um "sal" aleatório a cada hash. Por isso duas pessoas com
  // a mesma senha têm hashes diferentes no banco — e quem olhar a tabela não
  // consegue descobrir que elas usam a mesma senha.
  const a = await gerarHashDaSenha('senhaRepetida')
  const b = await gerarHashDaSenha('senhaRepetida')

  assert.notEqual(a, b)
  assert.equal(await conferirSenha('senhaRepetida', a), true)
  assert.equal(await conferirSenha('senhaRepetida', b), true)
})

test('o token guarda quem é o usuário e pode ser lido de volta', () => {
  const conteudo = {
    idUsuario: 7,
    email: 'teste@psigestor.com',
    perfil: 'Psicologo' as const,
    jti: gerarIdDeToken(),
  }

  const lido = lerToken(gerarToken(conteudo))

  assert.equal(lido.idUsuario, 7)
  assert.equal(lido.email, 'teste@psigestor.com')
  assert.equal(lido.perfil, 'Psicologo')
  assert.equal(lido.jti, conteudo.jti)
})

test('um token adulterado é recusado', () => {
  const token = gerarToken({
    idUsuario: 1,
    email: 'psicologo@psigestor.com',
    perfil: 'Psicologo',
    jti: gerarIdDeToken(),
  })

  // Simula um atacante trocando um caractere do token para tentar virar
  // administrador. A assinatura deixa de bater e a leitura falha.
  const adulterado = token.slice(0, -3) + 'aaa'

  assert.throws(() => lerToken(adulterado))
})

test('um token assinado com outro segredo é recusado', () => {
  const token = gerarToken({
    idUsuario: 1,
    email: 'invasor@exemplo.com',
    perfil: 'Administrador',
    jti: gerarIdDeToken(),
  })

  // Alguém que não conhece o nosso JWT_SECRET não consegue forjar um token
  // válido: ao conferir com o segredo real, a leitura falha.
  process.env.JWT_SECRET = 'um-segredo-completamente-diferente'
  assert.throws(() => lerToken(token))

  process.env.JWT_SECRET = 'segredo-usado-somente-nos-testes'
})
