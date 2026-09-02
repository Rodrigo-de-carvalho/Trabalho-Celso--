package com.clinica.odontologica.service;

import com.clinica.odontologica.entity.Paciente;
import com.clinica.odontologica.entity.PlanoOdontologico;
import com.clinica.odontologica.exception.ConflitoException;
import com.clinica.odontologica.exception.RecursoNaoEncontradoException;
import com.clinica.odontologica.repository.PacienteRepository;
import com.clinica.odontologica.repository.PlanoOdontologicoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service do Paciente.
 *
 * Aqui ficam as regras de negócio mais importantes do cadastro de pacientes:
 *  - CPF, e-mail e RG devem ser ÚNICOS (não pode repetir no banco);
 *  - se o paciente tiver um plano, esse plano precisa existir de verdade.
 */
@Service
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final PlanoOdontologicoRepository planoRepository;

    // Este service precisa de DOIS repositories: o de paciente e o de plano
    // (para validar o plano informado). O Spring injeta os dois pelo construtor.
    public PacienteService(PacienteRepository pacienteRepository,
                           PlanoOdontologicoRepository planoRepository) {
        this.pacienteRepository = pacienteRepository;
        this.planoRepository = planoRepository;
    }

    // Lista todos os pacientes.
    public List<Paciente> listarTodos() {
        return pacienteRepository.findAll();
    }

    // Busca um paciente pelo id; se não achar, devolve erro 404.
    public Paciente buscarPorId(Integer id) {
        return pacienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Paciente não encontrado com id " + id));
    }

    // Busca pacientes por nome OU CPF (usado na barra de busca do frontend).
    public List<Paciente> buscar(String termo) {
        return pacienteRepository
                .findByNomeCompletoContainingIgnoreCaseOrCpfContaining(termo, termo);
    }

    // Cria um novo paciente, aplicando as validações de unicidade antes de salvar.
    public Paciente criar(Paciente paciente) {
        validarUnicidadeParaCriacao(paciente); // checa CPF/e-mail/RG duplicados
        resolverPlano(paciente);               // confirma e carrega o plano (se houver)
        return pacienteRepository.save(paciente);
    }

    // Atualiza um paciente existente.
    public Paciente atualizar(Integer id, Paciente paciente) {
        buscarPorId(id);                        // garante que o paciente existe (senão 404)
        validarUnicidadeParaEdicao(paciente, id); // checa duplicidade ignorando ele mesmo
        resolverPlano(paciente);
        paciente.setIdPaciente(id);             // garante que vamos ATUALIZAR este id
        return pacienteRepository.save(paciente);
    }

    // Apaga um paciente.
    public void deletar(Integer id) {
        buscarPorId(id);
        pacienteRepository.deleteById(id);
    }

    // ---------------- MÉTODOS AUXILIARES (regras de negócio) ----------------

    // Verifica CPF, e-mail e RG únicos na hora de CRIAR um paciente novo.
    // Se algum já existir, lança ConflitoException (que vira HTTP 409 + mensagem clara).
    private void validarUnicidadeParaCriacao(Paciente p) {
        if (pacienteRepository.existsByCpf(p.getCpf())) {
            throw new ConflitoException("Já existe um paciente cadastrado com este CPF.");
        }
        // Só validamos e-mail/RG se eles foram informados (são campos opcionais).
        if (temValor(p.getEmail()) && pacienteRepository.existsByEmail(p.getEmail())) {
            throw new ConflitoException("Já existe um paciente cadastrado com este e-mail.");
        }
        if (temValor(p.getRg()) && pacienteRepository.existsByRg(p.getRg())) {
            throw new ConflitoException("Já existe um paciente cadastrado com este RG.");
        }
    }

    // Mesma validação, mas ignorando o próprio paciente (na EDIÇÃO ele pode manter o próprio CPF).
    private void validarUnicidadeParaEdicao(Paciente p, Integer id) {
        if (pacienteRepository.existsByCpfAndIdPacienteNot(p.getCpf(), id)) {
            throw new ConflitoException("Já existe OUTRO paciente cadastrado com este CPF.");
        }
        if (temValor(p.getEmail()) && pacienteRepository.existsByEmailAndIdPacienteNot(p.getEmail(), id)) {
            throw new ConflitoException("Já existe OUTRO paciente cadastrado com este e-mail.");
        }
        if (temValor(p.getRg()) && pacienteRepository.existsByRgAndIdPacienteNot(p.getRg(), id)) {
            throw new ConflitoException("Já existe OUTRO paciente cadastrado com este RG.");
        }
    }

    // Se o paciente veio com um plano, buscamos o plano REAL no banco (para garantir que
    // existe e para preencher todos os dados dele). Se não veio plano, deixamos como nulo
    // (paciente particular).
    private void resolverPlano(Paciente p) {
        if (p.getPlano() != null && p.getPlano().getIdPlano() != null) {
            PlanoOdontologico plano = planoRepository.findById(p.getPlano().getIdPlano())
                    .orElseThrow(() -> new RecursoNaoEncontradoException(
                            "Plano odontológico não encontrado com id " + p.getPlano().getIdPlano()));
            p.setPlano(plano);
        } else {
            p.setPlano(null);
        }
    }

    // Pequeno auxiliar: retorna true se o texto não é nulo e não está em branco.
    private boolean temValor(String texto) {
        return texto != null && !texto.isBlank();
    }
}
