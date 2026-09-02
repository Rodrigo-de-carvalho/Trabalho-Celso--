import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Paciente } from './Paciente'
import { dataHoraTransformer } from '../util/transformers'

/**
 * Entidade que representa a tabela "historico_clinico".
 *
 * Guarda informações de saúde do paciente (alergias, doenças, medicamentos)
 * que o dentista precisa saber antes de atender. Está sempre ligado a um paciente.
 */
@Entity({ name: 'historico_clinico' })
export class HistoricoClinico {
  @PrimaryGeneratedColumn({ name: 'id_historico' })
  idHistorico: number

  // Cada registro de histórico pertence a UM paciente (obrigatório).
  @ManyToOne(() => Paciente, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_paciente' })
  paciente: Paciente

  // Preenchido pelo banco (DEFAULT CURRENT_TIMESTAMP).
  @Column({
    name: 'data_registro',
    type: 'timestamp',
    insert: false,
    update: false,
    transformer: dataHoraTransformer,
  })
  dataRegistro: string

  @Column({ name: 'alergias', type: 'text', nullable: true })
  alergias: string | null

  @Column({ name: 'doencas_sistemicas', type: 'text', nullable: true })
  doencasSistemicas: string | null

  @Column({ name: 'medicamentos_continuos', type: 'text', nullable: true })
  medicamentosContinuos: string | null

  @Column({ name: 'observacoes', type: 'text', nullable: true })
  observacoes: string | null
}
