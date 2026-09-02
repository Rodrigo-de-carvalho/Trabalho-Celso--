package com.clinica.odontologica.repository;

import com.clinica.odontologica.entity.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository da Consulta. CRUD básico do JpaRepository.
 */
@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Integer> {
}
