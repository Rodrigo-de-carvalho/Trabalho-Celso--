import { Paciente } from '../entity/Paciente'
import { pacienteRepository, planoRepository } from '../repository/repositories'
import { ConflitoError, RecursoNaoEncontradoError, RequisicaoInvalidaError } from '../error/erros'
import { DadosRecebidos, lerIdRelacionamento, temValor, textoOuNulo } from './tipos'

/**
 * Service do Paciente.
 *
 * Aqui ficam as regras de negócio mais importantes do cadastro de pacientes:
 *  - CPF, e-mail e RG devem ser ÚNICOS (não pode repetir no banco);
 *  - se o paciente tiver um plano, esse plano precisa existir de verdade.
 */
export const pacienteService = {
  // Lista todos os pacientes.
  listarTodos(): Promise<Paciente[]> {
    return pacienteRepository.find()
  },

  // Busca um paciente pelo id; se não achar, devolve erro 404.
  async buscarPorId(id: number): Promise<Paciente> {
    const paciente = await pacienteRepository.findOneBy({ idPaciente: id })
    if (!paciente) {
      throw new RecursoNaoEncontradoError('Paciente não encontrado com id ' + id)
    }
    return paciente
  },

  // Busca pacientes por nome OU CPF (usado na barra de busca do frontend).
  buscar(termo: string): Promise<Paciente[]> {
    return pacienteRepository.buscarPorNomeOuCpf(termo)
  },

  // Cria um novo paciente, aplicando as validações de unicidade antes de salvar.
  async criar(dados: DadosRecebidos): Promise<Paciente> {
    const paciente = montarPaciente(dados)
    await validarUnicidadeParaCriacao(paciente) // checa CPF/e-mail/RG duplicados
    await resolverPlano(paciente, dados)        // confirma e carrega o plano (se houver)
    return pacienteRepository.save(paciente)
  },

  // Atualiza um paciente existente.
  async atualizar(id: number, dados: DadosRecebidos): Promise<Paciente> {
    await pacienteService.buscarPorId(id)          // garante que o paciente existe (senão 404)
    const paciente = montarPaciente(dados)
    await validarUnicidadeParaEdicao(paciente, id) // checa duplicidade ignorando ele mesmo
    await resolverPlano(paciente, dados)
    paciente.idPaciente = id                       // garante que vamos ATUALIZAR este id
    return pacienteRepository.save(paciente)
  },

  // Apaga um paciente.
  async deletar(id: number): Promise<void> {
    await pacienteService.buscarPorId(id)
    await pacienteRepository.delete({ idPaciente: id })
  },
}

// ---------------- MÉTODOS AUXILIARES (regras de negócio) ----------------

// Transforma o JSON recebido em uma entidade Paciente, validando o obrigatório.
function montarPaciente(dados: DadosRecebidos): Paciente {
  if (!temValor(dados.nomeCompleto)) {
    throw new RequisicaoInvalidaError('O nome completo do paciente é obrigatório.')
  }
  if (!temValor(dados.cpf)) {
    throw new RequisicaoInvalidaError('O CPF do paciente é obrigatório.')
  }
  if (!temValor(dados.telefone)) {
    throw new RequisicaoInvalidaError('O telefone do paciente é obrigatório.')
  }

  // Guardamos o CPF só com números (o banco tem VARCHAR(11)).
  const cpf = dados.cpf.replace(/\D/g, '')
  if (cpf.length !== 11) {
    throw new RequisicaoInvalidaError('O CPF deve ter 11 dígitos.')
  }

  const paciente = new Paciente()
  paciente.nomeCompleto = dados.nomeCompleto.trim()
  paciente.cpf = cpf
  paciente.telefone = dados.telefone.trim()
  paciente.dataNascimento = textoOuNulo(dados.dataNascimento)
  paciente.rg = textoOuNulo(dados.rg)
  paciente.sexo = textoOuNulo(dados.sexo)
  paciente.email = textoOuNulo(dados.email)
  paciente.endereco = textoOuNulo(dados.endereco)
  paciente.estado = textoOuNulo(dados.estado)
  paciente.cidade = textoOuNulo(dados.cidade)
  paciente.cep = textoOuNulo(dados.cep)
  paciente.numeroCarteirinha = textoOuNulo(dados.numeroCarteirinha)
  paciente.dataValidadePlano = textoOuNulo(dados.dataValidadePlano)
  paciente.plano = null

  return paciente
}

// Verifica CPF, e-mail e RG únicos na hora de CRIAR um paciente novo.
// Se algum já existir, lança ConflitoError (que vira HTTP 409 + mensagem clara).
async function validarUnicidadeParaCriacao(p: Paciente): Promise<void> {
  if (await pacienteRepository.existePorCpf(p.cpf)) {
    throw new ConflitoError('Já existe um paciente cadastrado com este CPF.')
  }
  // Só validamos e-mail/RG se eles foram informados (são campos opcionais).
  if (p.email && (await pacienteRepository.existePorEmail(p.email))) {
    throw new ConflitoError('Já existe um paciente cadastrado com este e-mail.')
  }
  if (p.rg && (await pacienteRepository.existePorRg(p.rg))) {
    throw new ConflitoError('Já existe um paciente cadastrado com este RG.')
  }
}

// Mesma validação, mas ignorando o próprio paciente (na EDIÇÃO ele pode manter o próprio CPF).
async function validarUnicidadeParaEdicao(p: Paciente, id: number): Promise<void> {
  if (await pacienteRepository.existePorCpfComOutroId(p.cpf, id)) {
    throw new ConflitoError('Já existe OUTRO paciente cadastrado com este CPF.')
  }
  if (p.email && (await pacienteRepository.existePorEmailComOutroId(p.email, id))) {
    throw new ConflitoError('Já existe OUTRO paciente cadastrado com este e-mail.')
  }
  if (p.rg && (await pacienteRepository.existePorRgComOutroId(p.rg, id))) {
    throw new ConflitoError('Já existe OUTRO paciente cadastrado com este RG.')
  }
}

// Se o paciente veio com um plano, buscamos o plano REAL no banco (para garantir que
// existe e para preencher todos os dados dele). Se não veio plano, deixamos como nulo
// (paciente particular).
async function resolverPlano(paciente: Paciente, dados: DadosRecebidos): Promise<void> {
  const idPlano = lerIdRelacionamento(dados.plano, 'idPlano')
  if (idPlano === null) {
    paciente.plano = null
    return
  }

  const plano = await planoRepository.findOneBy({ idPlano })
  if (!plano) {
    throw new RecursoNaoEncontradoError('Plano odontológico não encontrado com id ' + idPlano)
  }
  paciente.plano = plano
}
