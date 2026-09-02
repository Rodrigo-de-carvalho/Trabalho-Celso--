import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Usuario } from './Usuario'
import { dataHoraTransformer } from '../util/transformers'

/** Situações possíveis do cliente/paciente (igual ao ENUM do banco). */
export const SITUACOES_CLIENTE = ['Ativo', 'Inativo'] as const
export type SituacaoCliente = (typeof SITUACOES_CLIENTE)[number]

/**
 * Entidade que representa a tabela "clientes_pacientes".
 *
 * Guarda apenas dados ADMINISTRATIVOS das pessoas atendidas (nome, contato,
 * situação). Conteúdo clínico de sessão não entra no sistema, por ser
 * informação sigilosa e não necessária para a gestão.
 */
@Entity({ name: 'clientes_pacientes' })
export class ClientePaciente {
  @PrimaryGeneratedColumn({ name: 'id_cliente' })
  idCliente: number

  @Column({ name: 'nome_completo', type: 'varchar', length: 100 })
  nomeCompleto: string

  @Column({ name: 'data_nascimento', type: 'date', nullable: true })
  dataNascimento: string | null

  @Column({ name: 'email', type: 'varchar', length: 100, nullable: true })
  email: string | null

  @Column({ name: 'telefone', type: 'varchar', length: 15 })
  telefone: string

  @Column({ name: 'cidade', type: 'varchar', length: 50, nullable: true })
  cidade: string | null

  @Column({ name: 'estado', type: 'varchar', length: 2, nullable: true })
  estado: string | null

  // Preferimos INATIVAR a apagar, para não perder o histórico.
  @Column({ name: 'situacao', type: 'varchar' })
  situacao: SituacaoCliente

  @Column({ name: 'observacoes_administrativas', type: 'text', nullable: true })
  observacoesAdministrativas: string | null

  // Quem cadastrou este registro (rastreabilidade).
  @ManyToOne(() => Usuario, { nullable: true, eager: true })
  @JoinColumn({ name: 'id_usuario_cadastro' })
  usuarioCadastro: Usuario | null

  @Column({
    name: 'data_cadastro',
    type: 'timestamp',
    insert: false,
    update: false,
    transformer: dataHoraTransformer,
  })
  dataCadastro: string
}
