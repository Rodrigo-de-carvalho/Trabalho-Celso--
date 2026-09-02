// ============================================================
//  ClientePacienteService.ts — Gestão de clientes/pacientes
// ============================================================
// Regras de negócio:
//  - o psicólogo só enxerga (e só edita) pacientes vinculados a ele;
//  - registros não são apagados, apenas INATIVADOS (preserva o histórico);
//  - o vínculo psicólogo <-> paciente é criado e desfeito pelo administrador;
//  - toda criação/alteração fica registrada na auditoria.

import { ClientePaciente, SITUACOES_CLIENTE, SituacaoCliente } from '../entity/ClientePaciente'
import { Usuario } from '../entity/Usuario'
import { Vinculo } from '../entity/Vinculo'
import { PERFIL } from '../entity/Perfil'
import {
  clienteRepository,
  psicologoRepository,
  vinculoRepository,
} from '../repository/repositories'
import {
  ConflitoError,
  RecursoNaoEncontradoError,
  RequisicaoInvalidaError,
} from '../error/erros'
import { ConteudoDoToken } from '../util/seguranca'
import { exigirAcessoAoCliente, obterEscopo } from './acesso'
import { ACAO, logService } from './LogService'
import { DadosRecebidos, lerIdRelacionamento, temValor, textoOuNulo } from './tipos'

export const clientePacienteService = {
  /**
   * Lista os clientes/pacientes que o usuário logado tem direito de ver,
   * com busca por nome e filtro por situação.
   */
  async listar(
    logado: ConteudoDoToken,
    filtros: { termo?: string; situacao?: string }
  ): Promise<ClientePaciente[]> {
    const escopo = await obterEscopo(logado)

    const termo = (filtros.termo ?? '').trim()
    const encontrados =
      termo === ''
        ? await clienteRepository.find({ order: { nomeCompleto: 'ASC' } })
        : await clienteRepository.buscarPorNome(termo)

    return encontrados.filter((c) => {
      // O filtro de permissão é aplicado SEMPRE, antes de qualquer outro.
      if (escopo.tipo === 'vinculados' && !escopo.idsClientesPermitidos.includes(c.idCliente)) {
        return false
      }
      return !filtros.situacao || c.situacao === filtros.situacao
    })
  },

  /** Busca um cliente específico, respeitando a permissão de quem pediu. */
  async buscarPorId(id: number, logado: ConteudoDoToken): Promise<ClientePaciente> {
    const escopo = await obterEscopo(logado)
    // Verificamos a permissão ANTES de dizer se o registro existe: assim um
    // psicólogo não consegue descobrir quais ids existem no banco testando um a um.
    exigirAcessoAoCliente(escopo, id)

    const cliente = await clienteRepository.findOneBy({ idCliente: id })
    if (!cliente) {
      throw new RecursoNaoEncontradoError('Cliente/paciente não encontrado com id ' + id)
    }
    return cliente
  },

  /** Cadastra um cliente/paciente. */
  async criar(dados: DadosRecebidos, logado: ConteudoDoToken): Promise<ClientePaciente> {
    if (!temValor(dados.nomeCompleto)) {
      throw new RequisicaoInvalidaError('O nome completo é obrigatório.')
    }
    if (!temValor(dados.telefone)) {
      throw new RequisicaoInvalidaError('O telefone é obrigatório.')
    }

    const cliente = new ClientePaciente()
    cliente.nomeCompleto = dados.nomeCompleto.trim()
    cliente.telefone = dados.telefone.trim()
    cliente.dataNascimento = validarDataNascimento(dados.dataNascimento)
    cliente.email = textoOuNulo(dados.email)
    cliente.cidade = textoOuNulo(dados.cidade)
    cliente.estado = textoOuNulo(dados.estado)
    cliente.observacoesAdministrativas = textoOuNulo(dados.observacoesAdministrativas)
    cliente.situacao = dados.situacao === undefined ? 'Ativo' : validarSituacao(dados.situacao)
    cliente.usuarioCadastro = { idUsuario: logado.idUsuario } as Usuario

    const salvo = await clienteRepository.save(cliente)

    // Se quem cadastrou foi um psicólogo, já criamos o vínculo com ele —
    // sem isso, ele cadastraria um paciente e em seguida não conseguiria vê-lo.
    if (logado.perfil === PERFIL.PSICOLOGO) {
      const psicologo = await psicologoRepository.buscarPorUsuario(logado.idUsuario)
      if (psicologo) {
        const vinculo = new Vinculo()
        vinculo.psicologo = psicologo
        vinculo.cliente = salvo
        vinculo.dataInicio = new Date().toISOString().substring(0, 10)
        vinculo.dataFim = null
        vinculo.ativo = true
        await vinculoRepository.save(vinculo)
      }
    }

    await logService.registrar({
      idUsuario: logado.idUsuario,
      acao: ACAO.CRIAR,
      entidade: 'clientes_pacientes',
      idEntidade: salvo.idCliente,
      detalhes: `Cadastro do cliente/paciente ${salvo.nomeCompleto}.`,
    })

    return salvo
  },

  /** Atualiza um cliente/paciente (PATCH: só mexe no que foi enviado). */
  async atualizar(
    id: number,
    dados: DadosRecebidos,
    logado: ConteudoDoToken
  ): Promise<ClientePaciente> {
    const cliente = await clientePacienteService.buscarPorId(id, logado)
    const mudancas: string[] = []

    if (dados.nomeCompleto !== undefined) {
      if (!temValor(dados.nomeCompleto)) {
        throw new RequisicaoInvalidaError('O nome completo não pode ficar vazio.')
      }
      cliente.nomeCompleto = dados.nomeCompleto.trim()
      mudancas.push('nome')
    }
    if (dados.telefone !== undefined) {
      if (!temValor(dados.telefone)) {
        throw new RequisicaoInvalidaError('O telefone não pode ficar vazio.')
      }
      cliente.telefone = dados.telefone.trim()
      mudancas.push('telefone')
    }
    if (dados.dataNascimento !== undefined) {
      cliente.dataNascimento = validarDataNascimento(dados.dataNascimento)
      mudancas.push('data de nascimento')
    }
    if (dados.email !== undefined) {
      cliente.email = textoOuNulo(dados.email)
      mudancas.push('e-mail')
    }
    if (dados.cidade !== undefined) {
      cliente.cidade = textoOuNulo(dados.cidade)
      mudancas.push('cidade')
    }
    if (dados.estado !== undefined) {
      cliente.estado = textoOuNulo(dados.estado)
      mudancas.push('estado')
    }
    if (dados.observacoesAdministrativas !== undefined) {
      cliente.observacoesAdministrativas = textoOuNulo(dados.observacoesAdministrativas)
      mudancas.push('observações')
    }
    if (dados.situacao !== undefined) {
      cliente.situacao = validarSituacao(dados.situacao)
      mudancas.push('situação')
    }

    if (mudancas.length === 0) {
      throw new RequisicaoInvalidaError('Nenhum campo foi enviado para atualização.')
    }

    await clienteRepository.save(cliente)

    await logService.registrar({
      idUsuario: logado.idUsuario,
      acao: mudancas.includes('situação') ? ACAO.ALTERAR_SITUACAO : ACAO.ATUALIZAR,
      entidade: 'clientes_pacientes',
      idEntidade: id,
      detalhes:
        `Alterado(s): ${mudancas.join(', ')}.` +
        (mudancas.includes('situação') ? ` Nova situação: ${cliente.situacao}.` : ''),
    })

    return clientePacienteService.buscarPorId(id, logado)
  },

  // ---------------- VÍNCULOS ----------------

  /** Lista os vínculos de um psicólogo (quem ele atende). */
  async listarVinculosDoPsicologo(idPsicologo: number): Promise<Vinculo[]> {
    return vinculoRepository.listarPorPsicologo(idPsicologo)
  },

  /** Liga um paciente a um psicólogo (operação do administrador). */
  async vincular(dados: DadosRecebidos, logado: ConteudoDoToken): Promise<Vinculo> {
    const idPsicologo = lerIdRelacionamento(dados.psicologo, 'idPsicologo')
    const idCliente = lerIdRelacionamento(dados.cliente, 'idCliente')

    if (idPsicologo === null || idCliente === null) {
      throw new RequisicaoInvalidaError(
        'É obrigatório informar o psicólogo e o cliente/paciente do vínculo.'
      )
    }

    const psicologo = await psicologoRepository.findOneBy({ idPsicologo })
    if (!psicologo) {
      throw new RecursoNaoEncontradoError('Psicólogo não encontrado com id ' + idPsicologo)
    }
    const cliente = await clienteRepository.findOneBy({ idCliente })
    if (!cliente) {
      throw new RecursoNaoEncontradoError('Cliente/paciente não encontrado com id ' + idCliente)
    }

    // Se o par já existe, reativamos o vínculo antigo em vez de criar um novo
    // (a tabela tem UNIQUE nesse par, e assim o histórico é preservado).
    const existente = await vinculoRepository.buscarPar(idPsicologo, idCliente)
    if (existente) {
      if (existente.ativo) {
        throw new ConflitoError('Este cliente/paciente já está vinculado a este psicólogo.')
      }
      existente.ativo = true
      existente.dataFim = null
      existente.dataInicio = new Date().toISOString().substring(0, 10)
      const reativado = await vinculoRepository.save(existente)
      await logService.registrar({
        idUsuario: logado.idUsuario,
        acao: ACAO.VINCULAR,
        entidade: 'vinculos',
        idEntidade: reativado.idVinculo,
        detalhes: `Vínculo reativado entre ${psicologo.crp} e ${cliente.nomeCompleto}.`,
      })
      return reativado
    }

    const vinculo = new Vinculo()
    vinculo.psicologo = psicologo
    vinculo.cliente = cliente
    vinculo.dataInicio = temValor(dados.dataInicio)
      ? dados.dataInicio
      : new Date().toISOString().substring(0, 10)
    vinculo.dataFim = null
    vinculo.ativo = true

    const salvo = await vinculoRepository.save(vinculo)

    await logService.registrar({
      idUsuario: logado.idUsuario,
      acao: ACAO.VINCULAR,
      entidade: 'vinculos',
      idEntidade: salvo.idVinculo,
      detalhes: `${cliente.nomeCompleto} vinculado(a) ao psicólogo ${psicologo.crp}.`,
    })

    return salvo
  },

  /**
   * Encerra um vínculo. Assim como nos demais cadastros, não apagamos o
   * registro: marcamos como inativo e guardamos a data de encerramento.
   */
  async encerrarVinculo(idVinculo: number, logado: ConteudoDoToken): Promise<Vinculo> {
    const vinculo = await vinculoRepository.findOneBy({ idVinculo })
    if (!vinculo) {
      throw new RecursoNaoEncontradoError('Vínculo não encontrado com id ' + idVinculo)
    }
    if (!vinculo.ativo) {
      throw new ConflitoError('Este vínculo já está encerrado.')
    }

    vinculo.ativo = false
    vinculo.dataFim = new Date().toISOString().substring(0, 10)
    const salvo = await vinculoRepository.save(vinculo)

    await logService.registrar({
      idUsuario: logado.idUsuario,
      acao: ACAO.DESVINCULAR,
      entidade: 'vinculos',
      idEntidade: idVinculo,
      detalhes: `Vínculo encerrado entre ${vinculo.psicologo.crp} e ${vinculo.cliente.nomeCompleto}.`,
    })

    return salvo
  },
}

// ---------------- VALIDAÇÕES ----------------

function validarSituacao(valor: unknown): SituacaoCliente {
  if (typeof valor !== 'string' || !SITUACOES_CLIENTE.includes(valor as SituacaoCliente)) {
    throw new RequisicaoInvalidaError(
      'Situação inválida. Os valores aceitos são: ' + SITUACOES_CLIENTE.join(', ') + '.'
    )
  }
  return valor as SituacaoCliente
}

function validarDataNascimento(valor: unknown): string | null {
  const data = textoOuNulo(valor)
  if (data === null) return null

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    throw new RequisicaoInvalidaError('A data de nascimento deve estar no formato AAAA-MM-DD.')
  }
  // Data de nascimento no futuro é claramente um erro de digitação.
  if (data > new Date().toISOString().substring(0, 10)) {
    throw new RequisicaoInvalidaError('A data de nascimento não pode ser no futuro.')
  }
  return data
}
