import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Dentista } from './Dentista'

/**
 * Entidade que representa a tabela "agenda".
 *
 * Representa um bloco de horário de trabalho de um dentista em um dia
 * (das X às Y horas) e se aquele horário está disponível ou não.
 */
@Entity({ name: 'agenda' })
export class Agenda {
  @PrimaryGeneratedColumn({ name: 'id_agenda' })
  idAgenda: number

  // O horário pertence a UM dentista (obrigatório).
  @ManyToOne(() => Dentista, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_dentista' })
  dentista: Dentista

  // type: 'date' = só a data (tipo DATE no banco), no formato "AAAA-MM-DD".
  @Column({ name: 'data', type: 'date', nullable: false })
  data: string

  // type: 'time' = só a hora (tipo TIME no banco), no formato "HH:MM:SS".
  @Column({ name: 'hora_inicio', type: 'time', nullable: false })
  horaInicio: string

  @Column({ name: 'hora_fim', type: 'time', nullable: false })
  horaFim: string

  // true = horário livre; false = horário ocupado. No banco é BOOLEAN (padrão TRUE).
  @Column({ name: 'disponivel', type: 'boolean', nullable: true })
  disponivel: boolean | null
}
