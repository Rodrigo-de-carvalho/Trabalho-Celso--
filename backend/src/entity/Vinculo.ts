import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Psicologo } from './Psicologo'
import { ClientePaciente } from './ClientePaciente'

/**
 * Entidade que representa a tabela "vinculos".
 *
 * É a tabela que liga um psicólogo a um cliente/paciente e, por isso, é ela
 * que decide QUAIS pacientes cada psicólogo enxerga no sistema. Sem vínculo
 * ativo, o psicólogo simplesmente não vê o registro.
 */
@Entity({ name: 'vinculos' })
export class Vinculo {
  @PrimaryGeneratedColumn({ name: 'id_vinculo' })
  idVinculo: number

  @ManyToOne(() => Psicologo, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_psicologo' })
  psicologo: Psicologo

  @ManyToOne(() => ClientePaciente, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_cliente' })
  cliente: ClientePaciente

  @Column({ name: 'data_inicio', type: 'date' })
  dataInicio: string

  @Column({ name: 'data_fim', type: 'date', nullable: true })
  dataFim: string | null

  @Column({ name: 'ativo', type: 'boolean' })
  ativo: boolean
}
