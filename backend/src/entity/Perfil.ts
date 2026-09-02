import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

/**
 * Entidade que representa a tabela "perfis".
 *
 * O perfil define O QUE o usuário pode fazer no sistema:
 * Administrador, Psicologo ou Atendente.
 */
@Entity({ name: 'perfis' })
export class Perfil {
  @PrimaryGeneratedColumn({ name: 'id_perfil' })
  idPerfil: number

  @Column({ name: 'nome', type: 'varchar', length: 30, unique: true })
  nome: string

  @Column({ name: 'descricao', type: 'varchar', length: 255 })
  descricao: string
}

/**
 * Os nomes dos perfis usados nas verificações de permissão do sistema.
 * Deixá-los aqui, em um lugar só, evita erro de digitação espalhado pelo código.
 */
export const PERFIL = {
  ADMINISTRADOR: 'Administrador',
  PSICOLOGO: 'Psicologo',
  ATENDENTE: 'Atendente',
} as const

export type NomeDePerfil = (typeof PERFIL)[keyof typeof PERFIL]
