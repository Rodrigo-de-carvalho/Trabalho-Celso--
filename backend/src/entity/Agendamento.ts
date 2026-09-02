import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Paciente } from './Paciente'
import { Dentista } from './Dentista'
import { Procedimento } from './Procedimento'
import { dataHoraTransformer } from '../util/transformers'

/**
 * Entidade que representa a tabela "agendamento".
 *
 * É a marcação de um horário: qual paciente vai ser atendido, por qual dentista,
 * para qual procedimento e em que data/hora. É o "compromisso futuro".
 */
@Entity({ name: 'agendamento' })
export class Agendamento {
  @PrimaryGeneratedColumn({ name: 'id_agendamento' })
  idAgendamento: number

  // Cada agendamento pertence a UM paciente (obrigatório).
  // nullable: false reforça que esta ligação não pode ficar vazia (NOT NULL).
  @ManyToOne(() => Paciente, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_paciente' })
  paciente: Paciente

  // Cada agendamento é com UM dentista (obrigatório).
  @ManyToOne(() => Dentista, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_dentista' })
  dentista: Dentista

  // Cada agendamento é para UM procedimento (obrigatório).
  @ManyToOne(() => Procedimento, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_procedimento' })
  procedimento: Procedimento

  // DATETIME no banco = data + hora. O transformer entrega no formato
  // "AAAA-MM-DDTHH:MM:SS", o mesmo que o input datetime-local do HTML usa.
  @Column({
    name: 'data_hora',
    type: 'datetime',
    nullable: false,
    transformer: dataHoraTransformer,
  })
  dataHora: string

  // No banco é um ENUM. Valores possíveis: Agendado, Cancelado, Remarcado,
  // Paciente Faltou, Atendimento Concluído.
  // Se vier vazio, o service coloca "Agendado" como padrão.
  @Column({ name: 'status', type: 'varchar', nullable: true })
  status: string | null

  @Column({ name: 'observacoes', type: 'text', nullable: true })
  observacoes: string | null

  // Quando o agendamento foi registrado no sistema (preenchido pelo banco).
  @Column({
    name: 'data_agendamento',
    type: 'timestamp',
    insert: false,
    update: false,
    transformer: dataHoraTransformer,
  })
  dataAgendamento: string
}
