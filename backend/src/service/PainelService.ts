// ============================================================
//  PainelService.ts — Indicadores dos painéis
// ============================================================
// Monta os números que aparecem no topo das telas. São dois painéis:
//
//  - o do ADMINISTRADOR, com a visão geral da operação (usuários por situação,
//    total de psicólogos e de pacientes, agenda da casa inteira);
//  - o do PSICÓLOGO, com os números apenas dos SEUS pacientes e da SUA agenda.
//
// As taxas de confirmação e de falta são o retorno prático da funcionalidade
// inovadora: elas só existem porque a agenda acompanha o status de cada
// atendimento.

import { PERFIL } from '../entity/Perfil'
import { Atendimento } from '../entity/Atendimento'
import {
  atendimentoRepository,
  clienteRepository,
  psicologoRepository,
} from '../repository/repositories'
import { ConteudoDoToken } from '../util/seguranca'
import { obterEscopo } from './acesso'
import { usuarioService } from './UsuarioService'

export interface IndicadoresDaAgenda {
  total: number
  agendados: number
  confirmados: number
  realizados: number
  cancelados: number
  faltas: number
  /** Percentual de atendimentos que chegaram a ser confirmados (0 a 100). */
  taxaConfirmacao: number
  /** Percentual de faltas sobre os atendimentos que já passaram (0 a 100). */
  taxaFalta: number
  proximos: Atendimento[]
}

export const painelService = {
  async montarPainel(logado: ConteudoDoToken) {
    const escopo = await obterEscopo(logado)

    // O psicólogo vê apenas a própria agenda; os demais perfis veem tudo.
    const atendimentos =
      escopo.tipo === 'todos'
        ? await atendimentoRepository.find({ order: { dataHora: 'DESC' } })
        : await atendimentoRepository.listarPorPsicologo(escopo.idPsicologo)

    const agenda = calcularIndicadores(atendimentos)

    // Painel do psicólogo: números dos pacientes dele.
    if (escopo.tipo === 'vinculados') {
      const clientes = await clienteRepository.find()
      const meus = clientes.filter((c) => escopo.idsClientesPermitidos.includes(c.idCliente))
      return {
        perfil: PERFIL.PSICOLOGO,
        clientes: {
          total: meus.length,
          ativos: meus.filter((c) => c.situacao === 'Ativo').length,
          inativos: meus.filter((c) => c.situacao === 'Inativo').length,
        },
        agenda,
      }
    }

    // Painel do administrador (e do atendente): visão geral.
    const [usuarios, totalPsicologos, clientes] = await Promise.all([
      usuarioService.contarPorSituacao(),
      psicologoRepository.count(),
      clienteRepository.find(),
    ])

    return {
      perfil: logado.perfil,
      usuarios,
      psicologos: { total: totalPsicologos },
      clientes: {
        total: clientes.length,
        ativos: clientes.filter((c) => c.situacao === 'Ativo').length,
        inativos: clientes.filter((c) => c.situacao === 'Inativo').length,
      },
      agenda,
    }
  },
}

/** Conta os atendimentos por status e calcula as duas taxas. */
function calcularIndicadores(atendimentos: Atendimento[]): IndicadoresDaAgenda {
  const contar = (status: string) => atendimentos.filter((a) => a.status === status).length

  const agendados = contar('Agendado')
  const confirmados = contar('Confirmado')
  const realizados = contar('Realizado')
  const cancelados = contar('Cancelado')
  const faltas = contar('Falta')
  const total = atendimentos.length

  // "Chegou a ser confirmado" inclui os que já foram realizados: um atendimento
  // realizado necessariamente passou pela etapa de confirmação na prática.
  const confirmadosOuRealizados = confirmados + realizados

  // A taxa de falta compara com os atendimentos que já ACONTECERAM (realizados
  // + faltas). Incluir os que ainda estão no futuro rebaixaria o número de
  // forma artificial e enganosa.
  const jaAconteceram = realizados + faltas

  const agora = new Date().toISOString().substring(0, 19)

  return {
    total,
    agendados,
    confirmados,
    realizados,
    cancelados,
    faltas,
    taxaConfirmacao: total === 0 ? 0 : arredondar((confirmadosOuRealizados / total) * 100),
    taxaFalta: jaAconteceram === 0 ? 0 : arredondar((faltas / jaAconteceram) * 100),
    // Os próximos compromissos ainda não encerrados, do mais próximo ao mais distante.
    proximos: atendimentos
      .filter((a) => a.dataHora >= agora && (a.status === 'Agendado' || a.status === 'Confirmado'))
      .sort((a, b) => a.dataHora.localeCompare(b.dataHora))
      .slice(0, 5),
  }
}

function arredondar(valor: number): number {
  return Math.round(valor * 10) / 10
}
