// ============================================================
//  Testes da regra de privacidade (quem vê quais pacientes)
// ============================================================

import test from 'node:test'
import assert from 'node:assert/strict'

process.env.JWT_SECRET = 'segredo-usado-somente-nos-testes'

import { EscopoDeAcesso, exigirAcessoAoCliente, podeVerCliente } from '../service/acesso'
import { NaoAutorizadoError } from '../error/erros'

const escopoDeAdministrador: EscopoDeAcesso = { tipo: 'todos' }

const escopoDePsicologo: EscopoDeAcesso = {
  tipo: 'vinculados',
  idPsicologo: 1,
  idsClientesPermitidos: [10, 20],
}

test('administrador enxerga qualquer cliente', () => {
  assert.equal(podeVerCliente(escopoDeAdministrador, 10), true)
  assert.equal(podeVerCliente(escopoDeAdministrador, 999), true)
})

test('psicólogo enxerga apenas os clientes vinculados a ele', () => {
  assert.equal(podeVerCliente(escopoDePsicologo, 10), true)
  assert.equal(podeVerCliente(escopoDePsicologo, 20), true)
  // Paciente de outro psicólogo: invisível.
  assert.equal(podeVerCliente(escopoDePsicologo, 30), false)
})

test('acessar um cliente não vinculado gera erro 403', () => {
  assert.throws(
    () => exigirAcessoAoCliente(escopoDePsicologo, 30),
    (erro: unknown) => erro instanceof NaoAutorizadoError && erro.status === 403
  )
})

test('psicólogo sem cadastro profissional não enxerga nenhum cliente', () => {
  const semCadastro: EscopoDeAcesso = {
    tipo: 'vinculados',
    idPsicologo: 0,
    idsClientesPermitidos: [],
  }
  // O padrão seguro é ver NADA, e não ver tudo.
  assert.equal(podeVerCliente(semCadastro, 10), false)
})
