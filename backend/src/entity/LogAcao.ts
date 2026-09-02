import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Usuario } from './Usuario'
import { dataHoraTransformer } from '../util/transformers'

/**
 * Entidade que representa a tabela "logs_acoes" (auditoria).
 *
 * Registra QUEM fez O QUÊ e QUANDO. Só o administrador consulta estes
 * registros, e o sistema nunca os apaga — não existe rota de exclusão de log.
 */
@Entity({ name: 'logs_acoes' })
export class LogAcao {
  @PrimaryGeneratedColumn({ name: 'id_log' })
  idLog: number

  // Quem executou a ação (pode ser nulo em ações do próprio sistema).
  @ManyToOne(() => Usuario, { nullable: true, eager: true })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario | null

  // O que foi feito: CRIAR, ATUALIZAR, BLOQUEAR, LOGIN, CONFIRMAR...
  @Column({ name: 'acao', type: 'varchar', length: 60 })
  acao: string

  // Sobre qual tabela/recurso a ação aconteceu.
  @Column({ name: 'entidade', type: 'varchar', length: 40 })
  entidade: string

  @Column({ name: 'id_entidade', type: 'int', nullable: true })
  idEntidade: number | null

  @Column({ name: 'detalhes', type: 'varchar', length: 255, nullable: true })
  detalhes: string | null

  @Column({
    name: 'data_hora',
    type: 'timestamp',
    insert: false,
    update: false,
    transformer: dataHoraTransformer,
  })
  dataHora: string
}
