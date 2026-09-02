package com.clinica.odontologica.repository;

import com.clinica.odontologica.entity.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository do Pagamento. CRUD básico do JpaRepository.
 */
@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, Integer> {
}
