package com.clinica.odontologica.repository;

import com.clinica.odontologica.entity.HistoricoClinico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository do Histórico Clínico.
 * Tem um método extra para listar todos os históricos de um paciente.
 */
@Repository
public interface HistoricoClinicoRepository extends JpaRepository<HistoricoClinico, Integer> {

    // Busca todos os registros de histórico de um paciente específico (pelo id dele).
    List<HistoricoClinico> findByPacienteIdPaciente(Integer idPaciente);
}
