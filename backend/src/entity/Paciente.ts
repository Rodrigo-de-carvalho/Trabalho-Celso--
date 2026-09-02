import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { PlanoOdontologico } from './PlanoOdontologico'
import { dataHoraTransformer } from '../util/transformers'

/**
 * Entidade que representa a tabela "paciente".
 *
 * É o cliente da clínica. Guarda dados pessoais, de contato e (opcionalmente)
 * o plano odontológico que ele possui.
 */
@Entity({ name: 'paciente' })
export class Paciente {
  @PrimaryGeneratedColumn({ name: 'id_paciente' })
  idPaciente: number

  @Column({ name: 'nome_completo', type: 'varchar', length: 100, nullable: false })
  nomeCompleto: string

  // type: 'date' = só a data, sem horário (o MySQL devolve como "AAAA-MM-DD",
  // que é exatamente o formato que o input type="date" do HTML usa).
  @Column({ name: 'data_nascimento', type: 'date', nullable: true })
  dataNascimento: string | null

  // unique: true garante que NÃO existam dois pacientes com o mesmo CPF no banco.
  @Column({ name: 'cpf', type: 'varchar', length: 11, nullable: false, unique: true })
  cpf: string

  @Column({ name: 'rg', type: 'varchar', length: 12, nullable: true, unique: true })
  rg: string | null

  // No banco é um ENUM ('Masculino', 'Feminino', 'Prefiro não dizer').
  // Guardamos como texto (string) para ficar simples de enviar pelo frontend.
  @Column({ name: 'sexo', type: 'varchar', nullable: true })
  sexo: string | null

  @Column({ name: 'telefone', type: 'varchar', length: 15, nullable: false })
  telefone: string

  @Column({ name: 'email', type: 'varchar', length: 100, nullable: true, unique: true })
  email: string | null

  @Column({ name: 'endereco', type: 'varchar', length: 100, nullable: true })
  endereco: string | null

  // CHAR(2) no banco (ex: "SP", "RJ").
  @Column({ name: 'estado', type: 'varchar', length: 2, nullable: true })
  estado: string | null

  @Column({ name: 'cidade', type: 'varchar', length: 50, nullable: true })
  cidade: string | null

  @Column({ name: 'cep', type: 'varchar', length: 8, nullable: true })
  cep: string | null

  // @ManyToOne: VÁRIOS pacientes podem ter o MESMO plano (o lado "muitos").
  // @JoinColumn diz qual coluna do banco guarda a chave estrangeira (id_plano).
  // É opcional (nullable) porque um paciente pode não ter plano nenhum (particular).
  // eager: true faz o TypeORM já trazer o plano junto quando busca o paciente,
  // então o JSON devolvido ao frontend vem com os dados do plano dentro.
  @ManyToOne(() => PlanoOdontologico, { nullable: true, eager: true })
  @JoinColumn({ name: 'id_plano' })
  plano: PlanoOdontologico | null

  @Column({ name: 'numero_carteirinha', type: 'varchar', length: 30, nullable: true })
  numeroCarteirinha: string | null

  @Column({ name: 'data_validade_plano', type: 'date', nullable: true })
  dataValidadePlano: string | null

  // Data/hora em que o paciente foi cadastrado. insert/update: false porque quem
  // preenche esse campo é o PRÓPRIO BANCO (DEFAULT CURRENT_TIMESTAMP do schema.sql).
  @Column({
    name: 'data_cadastro',
    type: 'timestamp',
    insert: false,
    update: false,
    transformer: dataHoraTransformer,
  })
  dataCadastro: string
}
