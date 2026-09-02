import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { dataHoraTransformer } from '../util/transformers'

/**
 * Entidade que representa a tabela "dentista".
 *
 * É o profissional que atende os pacientes. O CRO é o registro no Conselho
 * Regional de Odontologia e, por isso, deve ser único.
 */
@Entity({ name: 'dentista' })
export class Dentista {
  @PrimaryGeneratedColumn({ name: 'id_dentista' })
  idDentista: number

  @Column({ name: 'nome_completo', type: 'varchar', length: 100, nullable: false })
  nomeCompleto: string

  // unique: true -> dois dentistas não podem ter o mesmo registro profissional.
  @Column({ name: 'cro', type: 'varchar', length: 20, nullable: false, unique: true })
  cro: string

  @Column({ name: 'especialidade', type: 'varchar', length: 100, nullable: true })
  especialidade: string | null

  @Column({ name: 'telefone', type: 'varchar', length: 15, nullable: false })
  telefone: string

  // E-mail obrigatório e único para o dentista.
  @Column({ name: 'email', type: 'varchar', length: 100, nullable: false, unique: true })
  email: string

  // Preenchido automaticamente pelo banco (DEFAULT CURRENT_TIMESTAMP).
  // insert/update: false porque quem preenche esse campo é o PRÓPRIO BANCO,
  // então o TypeScript só LÊ esse valor, nunca tenta gravá-lo.
  @Column({
    name: 'data_contratacao',
    type: 'timestamp',
    insert: false,
    update: false,
    transformer: dataHoraTransformer,
  })
  dataContratacao: string
}
