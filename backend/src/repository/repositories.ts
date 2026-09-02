// ============================================================
//  repositories.ts — A camada que CONVERSA COM O BANCO
// ============================================================
// Um "repository" do TypeORM já vem pronto com os métodos básicos:
// find (listar), findOneBy (buscar), save (salvar), delete (apagar), etc.
//
// Quando precisamos de uma consulta específica do sistema (ex: "quais pacientes
// estão vinculados a este psicólogo?"), usamos o .extend({...}) para adicionar
// métodos próprios, deixando as consultas longe dos services.

import { Like, Not } from 'typeorm'
import { AppDataSource } from '../config/data-source'

import { Perfil } from '../entity/Perfil'
import { Usuario } from '../entity/Usuario'
import { Psicologo } from '../entity/Psicologo'
import { ClientePaciente } from '../entity/ClientePaciente'
import { Vinculo } from '../entity/Vinculo'
import { Atendimento } from '../entity/Atendimento'
import { LogAcao } from '../entity/LogAcao'

// ----- PERFIS -----
export const perfilRepository = AppDataSource.getRepository(Perfil).extend({
  buscarPorNome(nome: string) {
    return this.findOneBy({ nome })
  },
})

// ----- USUÁRIOS -----
export const usuarioRepository = AppDataSource.getRepository(Usuario).extend({
  /**
   * Busca o usuário pelo e-mail TRAZENDO o hash da senha.
   *
   * Em todas as outras consultas o hash fica de fora (select: false na
   * entidade). Só o login precisa dele, e por isso ele é pedido aqui de forma
   * explícita — deixando visível no código o único ponto que lê a senha.
   */
  buscarParaLogin(email: string) {
    return this.createQueryBuilder('usuario')
      .addSelect('usuario.senhaHash')
      .leftJoinAndSelect('usuario.perfil', 'perfil')
      .where('usuario.email = :email', { email })
      .getOne()
  },

  existePorEmail(email: string) {
    return this.existsBy({ email })
  },

  existePorEmailComOutroId(email: string, idUsuario: number) {
    return this.existsBy({ email, idUsuario: Not(idUsuario) })
  },

  contarPorSituacao(situacao: string) {
    return this.countBy({ situacao: situacao as Usuario['situacao'] })
  },
})

// ----- PSICÓLOGOS -----
export const psicologoRepository = AppDataSource.getRepository(Psicologo).extend({
  existePorCrp(crp: string) {
    return this.existsBy({ crp })
  },
  existePorCrpComOutroId(crp: string, idPsicologo: number) {
    return this.existsBy({ crp, idPsicologo: Not(idPsicologo) })
  },
  // Descobre qual psicólogo corresponde ao usuário que está logado.
  buscarPorUsuario(idUsuario: number) {
    return this.findOneBy({ usuario: { idUsuario } })
  },
  existePorUsuario(idUsuario: number) {
    return this.existsBy({ usuario: { idUsuario } })
  },
})

// ----- CLIENTES / PACIENTES -----
export const clienteRepository = AppDataSource.getRepository(ClientePaciente).extend({
  // Busca por parte do nome. O Like com % dos dois lados procura o termo em
  // qualquer posição do texto (equivalente ao "contém").
  buscarPorNome(termo: string) {
    return this.find({ where: { nomeCompleto: Like(`%${termo}%`) } })
  },
})

// ----- VÍNCULOS (psicólogo <-> cliente) -----
export const vinculoRepository = AppDataSource.getRepository(Vinculo).extend({
  listarPorPsicologo(idPsicologo: number) {
    return this.findBy({ psicologo: { idPsicologo } })
  },
  listarAtivosPorPsicologo(idPsicologo: number) {
    return this.findBy({ psicologo: { idPsicologo }, ativo: true })
  },
  // Pergunta-chave da autorização: "este psicólogo pode ver este paciente?"
  existeVinculoAtivo(idPsicologo: number, idCliente: number) {
    return this.existsBy({ psicologo: { idPsicologo }, cliente: { idCliente }, ativo: true })
  },
  buscarPar(idPsicologo: number, idCliente: number) {
    return this.findOneBy({ psicologo: { idPsicologo }, cliente: { idCliente } })
  },
})

// ----- ATENDIMENTOS (funcionalidade inovadora) -----
export const atendimentoRepository = AppDataSource.getRepository(Atendimento).extend({
  listarPorPsicologo(idPsicologo: number) {
    return this.find({
      where: { psicologo: { idPsicologo } },
      order: { dataHora: 'DESC' },
    })
  },
  // Impede dois atendimentos do mesmo psicólogo no mesmo horário.
  existeNoHorario(idPsicologo: number, dataHora: string) {
    return this.existsBy({ psicologo: { idPsicologo }, dataHora })
  },
  existeNoHorarioComOutroId(idPsicologo: number, dataHora: string, idAtendimento: number) {
    return this.existsBy({
      psicologo: { idPsicologo },
      dataHora,
      idAtendimento: Not(idAtendimento),
    })
  },
})

// ----- LOGS DE AÇÕES -----
// Sem métodos de exclusão: registros de auditoria nunca são apagados.
export const logRepository = AppDataSource.getRepository(LogAcao)
