import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Usuario } from './Usuario'

/** As áreas de atuação previstas no edital (igual ao ENUM do banco). */
export const AREAS_DE_ATUACAO = [
  'Clínica',
  'Organizacional e do Trabalho',
  'Escolar e Educacional',
  'Hospitalar',
  'Social',
  'Jurídica',
  'Do Esporte',
  'Do Trânsito',
  'Neuropsicologia',
  'Pesquisa e Docência',
] as const
export type AreaDeAtuacao = (typeof AREAS_DE_ATUACAO)[number]

/**
 * Entidade que representa a tabela "psicologos".
 *
 * Guarda os dados PROFISSIONAIS. Os dados de acesso (e-mail, senha, situação)
 * ficam no usuário ligado a este psicólogo — por isso a relação é @OneToOne:
 * um psicólogo é exatamente um usuário do sistema.
 */
@Entity({ name: 'psicologos' })
export class Psicologo {
  @PrimaryGeneratedColumn({ name: 'id_psicologo' })
  idPsicologo: number

  @OneToOne(() => Usuario, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario

  // CRP = registro no Conselho Regional de Psicologia. Único por profissional.
  @Column({ name: 'crp', type: 'varchar', length: 20, unique: true })
  crp: string

  @Column({ name: 'area_atuacao', type: 'varchar' })
  areaAtuacao: AreaDeAtuacao

  @Column({ name: 'abordagem', type: 'varchar', length: 100, nullable: true })
  abordagem: string | null

  @Column({ name: 'telefone', type: 'varchar', length: 15, nullable: true })
  telefone: string | null
}
