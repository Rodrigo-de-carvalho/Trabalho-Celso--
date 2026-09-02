import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Consulta } from './Consulta'
import { dataHoraTransformer, decimalTransformer } from '../util/transformers'

/**
 * Entidade que representa a tabela "pagamento".
 *
 * Registra como o paciente pagou por uma consulta (dinheiro, pix, cartão...),
 * o valor pago e em quantas parcelas.
 */
@Entity({ name: 'pagamento' })
export class Pagamento {
  @PrimaryGeneratedColumn({ name: 'id_pagamento' })
  idPagamento: number

  // Todo pagamento está ligado a UMA consulta (obrigatório).
  @ManyToOne(() => Consulta, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_consulta' })
  consulta: Consulta

  // No banco é um ENUM: Dinheiro, Cartão Débito, Cartão Crédito, Pix, Boleto.
  @Column({ name: 'forma_pagamento', type: 'varchar', nullable: false })
  formaPagamento: string

  @Column({
    name: 'valor_pago',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: decimalTransformer,
  })
  valorPago: number

  // Preenchido pelo banco (DEFAULT CURRENT_TIMESTAMP).
  @Column({
    name: 'data_pagamento',
    type: 'timestamp',
    insert: false,
    update: false,
    transformer: dataHoraTransformer,
  })
  dataPagamento: string

  // Número de parcelas (padrão 1 = à vista).
  @Column({ name: 'parcelas', type: 'int', nullable: true })
  parcelas: number | null

  @Column({ name: 'descricao', type: 'varchar', length: 100, nullable: true })
  descricao: string | null
}
