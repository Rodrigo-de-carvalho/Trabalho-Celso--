import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Agendamento } from './Agendamento'
import { Paciente } from './Paciente'
import { Dentista } from './Dentista'
import { Procedimento } from './Procedimento'
import { dataHoraTransformer, decimalTransformer } from '../util/transformers'

/**
 * Entidade que representa a tabela "consulta".
 *
 * É o atendimento que REALMENTE aconteceu (diferente do agendamento, que é a marcação).
 * Guarda o valor_total já calculado (procedimento - desconto do plano do paciente).
 */
@Entity({ name: 'consulta' })
export class Consulta {
  @PrimaryGeneratedColumn({ name: 'id_consulta' })
  idConsulta: number

  // A consulta nasce de um agendamento (obrigatório).
  @ManyToOne(() => Agendamento, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_agendamento' })
  agendamento: Agendamento

  @ManyToOne(() => Paciente, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_paciente' })
  paciente: Paciente

  @ManyToOne(() => Dentista, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_dentista' })
  dentista: Dentista

  @ManyToOne(() => Procedimento, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_procedimento' })
  procedimento: Procedimento

  // Data e hora em que a consulta foi realizada de fato.
  @Column({
    name: 'data_hora_realizacao',
    type: 'datetime',
    nullable: false,
    transformer: dataHoraTransformer,
  })
  dataHoraRealizacao: string

  @Column({ name: 'observacoes', type: 'text', nullable: true })
  observacoes: string | null

  // Valor final da consulta. É CALCULADO pelo service (não vem direto do usuário):
  // valor do procedimento menos o desconto do plano odontológico do paciente.
  @Column({
    name: 'valor_total',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: decimalTransformer,
  })
  valorTotal: number
}
