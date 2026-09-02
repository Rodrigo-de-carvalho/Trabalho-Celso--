// ============================================================
//  AtendimentoService.ts — Agenda com confirmação (INOVAÇÃO)
// ============================================================
// Esta é a funcionalidade inovadora do produto. Além de organizar os horários,
// ela acompanha o CICLO DE VIDA de cada atendimento:
//
//     Agendado --confirmar--> Confirmado --> Realizado
//         \                        \
//          \--> Cancelado           \--> Falta
//
// O valor para o psicólogo está nos indicadores que nascem daí: quantos
// atendimentos foram confirmados e quantas faltas aconteceram — informação que
// hoje se perde em conversas de aplicativo de mensagens.
//
// Regras de negócio:
//  - o psicólogo só agenda para pacientes vinculados a ele;
//  - não pode haver dois atendimentos do mesmo psicólogo no mesmo horário;
//  - só dá para confirmar um atendimento que ainda está "Agendado";
//  - a mudança de status respeita as transições do diagrama acima.

import {
  Atendimento,
  MODALIDADES,
  Modalidade,
  STATUS_ATENDIMENTO,
  StatusAtendimento,
} from '../entity/Atendimento'
import { PERFIL } from '../entity/Perfil'
import {
  atendimentoRepository,
  clienteRepository,
  psicologoRepository,
  vinculoRepository,
} from '../repository/repositories'
import {
  ConflitoError,
  NaoAutorizadoError,
  RecursoNaoEncontradoError,
  RequisicaoInvalidaError,
} from '../error/erros'
import { ConteudoDoToken } from '../util/seguranca'
import { obterEscopo } from './acesso'
import { ACAO, logService } from './LogService'
import { DadosRecebidos, lerIdRelacionamento, temValor, textoOuNulo } from './tipos'

/**
 * De cada status, para quais outros é permitido ir.
 *
 * Deixar isso explícito em uma tabela evita bugs do tipo "reabrir" um
 * atendimento cancelado ou confirmar um que já aconteceu.
 */
const TRANSICOES_PERMITIDAS: Record<StatusAtendimento, StatusAtendimento[]> = {
  Agendado: ['Confirmado', 'Cancelado', 'Realizado', 'Falta'],
  Confirmado: ['Realizado', 'Cancelado', 'Falta'],
  Realizado: [],
  Cancelado: [],
  Falta: [],
}

export const atendimentoService = {
  /** Lista os atendimentos que o usuário logado pode ver. */
  async listar(logado: ConteudoDoToken): Promise<Atendimento[]> {
    const escopo = await obterEscopo(logado)

    if (escopo.tipo === 'todos') {
      return atendimentoRepository.find({ order: { dataHora: 'DESC' } })
    }
    // Psicólogo: apenas a própria agenda.
    return atendimentoRepository.listarPorPsicologo(escopo.idPsicologo)
  },

  async buscarPorId(id: number, logado: ConteudoDoToken): Promise<Atendimento> {
    const atendimento = await atendimentoRepository.findOneBy({ idAtendimento: id })
    if (!atendimento) {
      throw new RecursoNaoEncontradoError('Atendimento não encontrado com id ' + id)
    }

    const escopo = await obterEscopo(logado)
    if (escopo.tipo === 'vinculados' && atendimento.psicologo.idPsicologo !== escopo.idPsicologo) {
      throw new NaoAutorizadoError('Você não tem permissão para acessar este atendimento.')
    }
    return atendimento
  },

  /** Agenda um novo atendimento. */
  async criar(dados: DadosRecebidos, logado: ConteudoDoToken): Promise<Atendimento> {
    const idPsicologo = await resolverPsicologo(dados, logado)
    const idCliente = lerIdRelacionamento(dados.cliente, 'idCliente')
    if (idCliente === null) {
      throw new RequisicaoInvalidaError('É obrigatório informar o cliente/paciente do atendimento.')
    }

    const psicologo = await psicologoRepository.findOneBy({ idPsicologo })
    if (!psicologo) {
      throw new RecursoNaoEncontradoError('Psicólogo não encontrado com id ' + idPsicologo)
    }
    const cliente = await clienteRepository.findOneBy({ idCliente })
    if (!cliente) {
      throw new RecursoNaoEncontradoError('Cliente/paciente não encontrado com id ' + idCliente)
    }

    // Só se agenda para quem é paciente daquele psicólogo.
    if (!(await vinculoRepository.existeVinculoAtivo(idPsicologo, idCliente))) {
      throw new RequisicaoInvalidaError(
        'Este cliente/paciente não está vinculado a este psicólogo. Crie o vínculo antes de agendar.'
      )
    }
    // Não faz sentido agendar para quem foi inativado.
    if (cliente.situacao !== 'Ativo') {
      throw new RequisicaoInvalidaError(
        'Não é possível agendar atendimento para um cliente/paciente inativo.'
      )
    }

    const dataHora = validarDataHora(dados.dataHora)
    if (await atendimentoRepository.existeNoHorario(idPsicologo, dataHora)) {
      throw new ConflitoError(
        'Este psicólogo já possui um atendimento marcado nesta data e horário.'
      )
    }

    const atendimento = new Atendimento()
    atendimento.psicologo = psicologo
    atendimento.cliente = cliente
    atendimento.dataHora = dataHora
    atendimento.duracaoMinutos = validarDuracao(dados.duracaoMinutos)
    atendimento.modalidade = validarModalidade(dados.modalidade ?? 'Presencial')
    // Todo atendimento nasce como "Agendado" e só sai daí pelas transições.
    atendimento.status = 'Agendado'
    atendimento.confirmadoEm = null
    atendimento.observacoes = textoOuNulo(dados.observacoes)

    const salvo = await atendimentoRepository.save(atendimento)

    await logService.registrar({
      idUsuario: logado.idUsuario,
      acao: ACAO.CRIAR,
      entidade: 'atendimentos',
      idEntidade: salvo.idAtendimento,
      detalhes: `Atendimento agendado para ${cliente.nomeCompleto} em ${dataHora}.`,
    })

    return salvo
  },

  /** Confirma a presença — o passo que dá nome à funcionalidade. */
  async confirmar(id: number, logado: ConteudoDoToken): Promise<Atendimento> {
    const atendimento = await atendimentoService.buscarPorId(id, logado)

    if (atendimento.status !== 'Agendado') {
      throw new ConflitoError(
        `Só é possível confirmar um atendimento com status "Agendado". ` +
          `Este está como "${atendimento.status}".`
      )
    }

    atendimento.status = 'Confirmado'
    atendimento.confirmadoEm = new Date().toISOString().substring(0, 19)
    const salvo = await atendimentoRepository.save(atendimento)

    await logService.registrar({
      idUsuario: logado.idUsuario,
      acao: ACAO.CONFIRMAR,
      entidade: 'atendimentos',
      idEntidade: id,
      detalhes: `Atendimento de ${atendimento.cliente.nomeCompleto} confirmado.`,
    })

    return salvo
  },

  /** Atualiza status, observações ou horário de um atendimento. */
  async atualizar(
    id: number,
    dados: DadosRecebidos,
    logado: ConteudoDoToken
  ): Promise<Atendimento> {
    const atendimento = await atendimentoService.buscarPorId(id, logado)
    const mudancas: string[] = []

    if (dados.status !== undefined) {
      const novoStatus = validarStatus(dados.status)
      if (novoStatus !== atendimento.status) {
        if (!TRANSICOES_PERMITIDAS[atendimento.status].includes(novoStatus)) {
          throw new ConflitoError(
            `Não é possível mudar o status de "${atendimento.status}" para "${novoStatus}".`
          )
        }
        atendimento.status = novoStatus
        if (novoStatus === 'Confirmado' && atendimento.confirmadoEm === null) {
          atendimento.confirmadoEm = new Date().toISOString().substring(0, 19)
        }
        mudancas.push(`status para ${novoStatus}`)
      }
    }

    if (dados.dataHora !== undefined) {
      // Remarcar só faz sentido enquanto o atendimento ainda não terminou.
      if (atendimento.status === 'Realizado' || atendimento.status === 'Cancelado') {
        throw new ConflitoError('Não é possível remarcar um atendimento já encerrado.')
      }
      const dataHora = validarDataHora(dados.dataHora)
      if (
        await atendimentoRepository.existeNoHorarioComOutroId(
          atendimento.psicologo.idPsicologo,
          dataHora,
          id
        )
      ) {
        throw new ConflitoError(
          'Este psicólogo já possui um atendimento marcado nesta data e horário.'
        )
      }
      atendimento.dataHora = dataHora
      mudancas.push('data/hora')
    }

    if (dados.modalidade !== undefined) {
      atendimento.modalidade = validarModalidade(dados.modalidade)
      mudancas.push('modalidade')
    }
    if (dados.observacoes !== undefined) {
      atendimento.observacoes = textoOuNulo(dados.observacoes)
      mudancas.push('observações')
    }

    if (mudancas.length === 0) {
      throw new RequisicaoInvalidaError('Nenhum campo foi enviado para atualização.')
    }

    await atendimentoRepository.save(atendimento)

    await logService.registrar({
      idUsuario: logado.idUsuario,
      acao: ACAO.ATUALIZAR,
      entidade: 'atendimentos',
      idEntidade: id,
      detalhes: `Alterado(s): ${mudancas.join(', ')}.`,
    })

    return atendimentoService.buscarPorId(id, logado)
  },
}

// ---------------- VALIDAÇÕES ----------------

/**
 * Decide de quem é a agenda.
 *
 * O psicólogo agenda sempre na PRÓPRIA agenda (ignoramos qualquer id que ele
 * mande no corpo da requisição, justamente para ele não conseguir marcar
 * horário na agenda de um colega). Administrador e atendente informam para
 * qual psicólogo o atendimento está sendo marcado.
 */
async function resolverPsicologo(
  dados: DadosRecebidos,
  logado: ConteudoDoToken
): Promise<number> {
  if (logado.perfil === PERFIL.PSICOLOGO) {
    const psicologo = await psicologoRepository.buscarPorUsuario(logado.idUsuario)
    if (!psicologo) {
      throw new RecursoNaoEncontradoError(
        'O seu usuário não está vinculado a um cadastro de psicólogo. Procure o administrador.'
      )
    }
    return psicologo.idPsicologo
  }

  const idPsicologo = lerIdRelacionamento(dados.psicologo, 'idPsicologo')
  if (idPsicologo === null) {
    throw new RequisicaoInvalidaError('É obrigatório informar o psicólogo do atendimento.')
  }
  return idPsicologo
}

function validarDataHora(valor: unknown): string {
  if (!temValor(valor)) {
    throw new RequisicaoInvalidaError('É obrigatório informar a data e a hora do atendimento.')
  }
  // Aceita "AAAA-MM-DDTHH:MM" (o formato do input datetime-local) com ou sem os segundos.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(valor)) {
    throw new RequisicaoInvalidaError(
      'A data e hora devem estar no formato AAAA-MM-DDTHH:MM.'
    )
  }
  return valor.length === 16 ? valor + ':00' : valor
}

function validarDuracao(valor: unknown): number {
  if (valor === undefined || valor === null || valor === '') return 50
  const duracao = Number(valor)
  if (!Number.isInteger(duracao) || duracao < 10 || duracao > 240) {
    throw new RequisicaoInvalidaError('A duração deve ser um número de minutos entre 10 e 240.')
  }
  return duracao
}

function validarModalidade(valor: unknown): Modalidade {
  if (typeof valor !== 'string' || !MODALIDADES.includes(valor as Modalidade)) {
    throw new RequisicaoInvalidaError(
      'Modalidade inválida. As aceitas são: ' + MODALIDADES.join(', ') + '.'
    )
  }
  return valor as Modalidade
}

function validarStatus(valor: unknown): StatusAtendimento {
  if (typeof valor !== 'string' || !STATUS_ATENDIMENTO.includes(valor as StatusAtendimento)) {
    throw new RequisicaoInvalidaError(
      'Status inválido. Os aceitos são: ' + STATUS_ATENDIMENTO.join(', ') + '.'
    )
  }
  return valor as StatusAtendimento
}
