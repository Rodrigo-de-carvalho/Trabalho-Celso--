import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { decimalTransformer } from '../util/transformers'

/**
 * Entidade que representa a tabela "plano_odontologico" do banco.
 *
 * Uma Entity é uma classe TypeScript que "espelha" uma tabela: cada objeto desta
 * classe vira uma linha na tabela, e cada atributo vira uma coluna.
 */
// @Entity marca esta classe como uma entidade do TypeORM e diz exatamente qual
// o nome da tabela no banco (igual ao schema.sql).
@Entity({ name: 'plano_odontologico' })
export class PlanoOdontologico {
  // @PrimaryGeneratedColumn = CHAVE PRIMÁRIA gerada pelo próprio banco
  // (AUTO_INCREMENT do MySQL). O name liga o atributo à coluna "id_plano".
  @PrimaryGeneratedColumn({ name: 'id_plano' })
  idPlano: number

  // nullable: false significa que é obrigatório (NOT NULL no banco).
  @Column({ name: 'nome_plano', type: 'varchar', length: 100, nullable: false })
  nomePlano: string

  @Column({ name: 'operadora', type: 'varchar', length: 100, nullable: true })
  operadora: string | null

  // Percentual de desconto que o plano dá (ex: 20.00 = 20%). Usado no cálculo da consulta.
  // O transformer converte o texto que o MySQL devolve ("20.00") para número.
  @Column({
    name: 'desconto_percentual',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  descontoPercentual: number | null

  // type: 'text' garante que no banco essa coluna seja do tipo TEXT (texto longo).
  @Column({ name: 'cobertura', type: 'text', nullable: true })
  cobertura: string | null
}
