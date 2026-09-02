import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Perfil } from './Perfil'
import { dataHoraTransformer } from '../util/transformers'

/** As três situações possíveis de um usuário (igual ao ENUM do banco). */
export const SITUACOES_USUARIO = ['Ativo', 'Inativo', 'Bloqueado'] as const
export type SituacaoUsuario = (typeof SITUACOES_USUARIO)[number]

/**
 * Entidade que representa a tabela "usuarios".
 *
 * É quem consegue entrar na plataforma. Só usuários com situação "Ativo"
 * conseguem fazer login (ver AuthService).
 */
@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  idUsuario: number

  @Column({ name: 'nome_completo', type: 'varchar', length: 100 })
  nomeCompleto: string

  @Column({ name: 'email', type: 'varchar', length: 100, unique: true })
  email: string

  /**
   * A senha NUNCA é guardada em texto puro: aqui fica o hash bcrypt dela.
   *
   * select: false é a proteção mais importante desta entidade — faz o TypeORM
   * NÃO trazer esta coluna nas consultas comuns. Assim, mesmo que alguém
   * esqueça de filtrar, o hash não vaza no JSON devolvido pela API. Quem
   * precisa dele (o login) pede a coluna explicitamente.
   */
  @Column({ name: 'senha_hash', type: 'varchar', length: 255, select: false })
  senhaHash: string

  @ManyToOne(() => Perfil, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_perfil' })
  perfil: Perfil

  @Column({ name: 'situacao', type: 'varchar' })
  situacao: SituacaoUsuario

  @Column({
    name: 'data_cadastro',
    type: 'timestamp',
    insert: false,
    update: false,
    transformer: dataHoraTransformer,
  })
  dataCadastro: string

  @Column({
    name: 'ultimo_acesso',
    type: 'datetime',
    nullable: true,
    transformer: dataHoraTransformer,
  })
  ultimoAcesso: string | null
}
