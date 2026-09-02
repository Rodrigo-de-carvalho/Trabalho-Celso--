import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Psicologo } from './Psicologo'
import { ClientePaciente } from './ClientePaciente'
import { dataHoraTransformer } from '../util/transformers'

/**
 * O ciclo de vida de um atendimento:
 *
 *   Agendado --confirmar--> Confirmado --> Realizado
 *       \                        \
 *        \--> Cancelado           \--> Falta
 */
export const STATUS_ATENDIMENTO = [
  'Agendado',
  'Confirmado',
  'Realizado',
  'Cancelado',
  'Falta',
] as const
export type StatusAtendimento = (typeof STATUS_ATENDIMENTO)[number]

export const MODALIDADES = ['Presencial', 'Online'] as const
export type Modalidade = (typeof MODALIDADES)[number]

/**
 * Entidade que representa a tabela "atendimentos".
 *
 * É a tabela da nossa FUNCIONALIDADE INOVADORA: a agenda com confirmação.
 * Além de organizar os horários, ela alimenta os indicadores dos painéis
 * (taxa de confirmação e taxa de faltas).
 */
@Entity({ name: 'atendimentos' })
export class Atendimento {
  @PrimaryGeneratedColumn({ name: 'id_atendimento' })
  idAtendimento: number

  @ManyToOne(() => Psicologo, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_psicologo' })
  psicologo: Psicologo

  @ManyToOne(() => ClientePaciente, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_cliente' })
  cliente: ClientePaciente

  @Column({ name: 'data_hora', type: 'datetime', transformer: dataHoraTransformer })
  dataHora: string

  @Column({ name: 'duracao_minutos', type: 'int' })
  duracaoMinutos: number

  @Column({ name: 'modalidade', type: 'varchar' })
  modalidade: Modalidade

  @Column({ name: 'status', type: 'varchar' })
  status: StatusAtendimento

  // Fica nulo até o atendimento ser confirmado.
  @Column({
    name: 'confirmado_em',
    type: 'datetime',
    nullable: true,
    transformer: dataHoraTransformer,
  })
  confirmadoEm: string | null

  @Column({ name: 'observacoes', type: 'text', nullable: true })
  observacoes: string | null

  @Column({
    name: 'data_criacao',
    type: 'timestamp',
    insert: false,
    update: false,
    transformer: dataHoraTransformer,
  })
  dataCriacao: string
}
