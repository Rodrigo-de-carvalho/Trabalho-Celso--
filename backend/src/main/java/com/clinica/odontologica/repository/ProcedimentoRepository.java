package com.clinica.odontologica.repository;

import com.clinica.odontologica.entity.Procedimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository do Procedimento.
 * Usa apenas os métodos prontos do JpaRepository (CRUD básico).
 */
@Repository
public interface ProcedimentoRepository extends JpaRepository<Procedimento, Integer> {
}
