import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { decimalTransformer } from '../util/transformers'

/**
 * Entidade que representa a tabela "procedimento".
 *
 * É o serviço odontológico oferecido (ex: Limpeza, Restauração, Canal),
 * com seu valor base e o tempo estimado de duração em minutos.
 */
@Entity({ name: 'procedimento' })
export class Procedimento {
  @PrimaryGeneratedColumn({ name: 'id_procedimento' })
  idProcedimento: number

  @Column({ name: 'nome', type: 'varchar', length: 100, nullable: false })
  nome: string

  @Column({ name: 'descricao', type: 'text', nullable: true })
  descricao: string | null

  // DECIMAL(10,2) é o tipo certo para DINHEIRO no banco (não usa ponto flutuante,
  // então não sofre com erros de arredondamento).
  @Column({
    name: 'valor',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: decimalTransformer,
  })
  valor: number

  // Tempo estimado em minutos.
  @Column({ name: 'tempo_estimado', type: 'int', nullable: true })
  tempoEstimado: number | null
}
