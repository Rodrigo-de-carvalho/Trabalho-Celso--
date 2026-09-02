package com.clinica.odontologica.repository;

import com.clinica.odontologica.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository do Paciente.
 *
 * Além dos métodos prontos do JpaRepository, declaramos alguns métodos extras.
 * O Spring Data lê o NOME do método e cria a consulta SQL automaticamente
 * (isso se chama "query methods" / consultas derivadas do nome).
 */
@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Integer> {

    // "existsByCpf" gera: SELECT existe? WHERE cpf = ?. Usado para barrar CPF duplicado.
    boolean existsByCpf(String cpf);

    // Mesma ideia, mas ignorando um id específico. Útil ao EDITAR um paciente:
    // queremos saber se OUTRO paciente (id diferente) já usa esse CPF.
    boolean existsByCpfAndIdPacienteNot(String cpf, Integer idPaciente);

    // Verificações de e-mail único (na criação e na edição).
    boolean existsByEmail(String email);

    boolean existsByEmailAndIdPacienteNot(String email, Integer idPaciente);

    // Verificações de RG único (na criação e na edição).
    boolean existsByRg(String rg);

    boolean existsByRgAndIdPacienteNot(String rg, Integer idPaciente);

    // Busca por nome OU por CPF, ambos "contendo" o termo digitado (LIKE %termo%).
    // IgnoreCase = não diferencia maiúsculas/minúsculas no nome.
    // É isso que alimenta a busca da tela de Pacientes no frontend.
    List<Paciente> findByNomeCompletoContainingIgnoreCaseOrCpfContaining(String nome, String cpf);
}
