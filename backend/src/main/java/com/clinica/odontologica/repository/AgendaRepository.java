package com.clinica.odontologica.repository;

import com.clinica.odontologica.entity.Agenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository da Agenda (horários de trabalho dos dentistas).
 * Tem um método extra para listar os horários de um dentista.
 */
@Repository
public interface AgendaRepository extends JpaRepository<Agenda, Integer> {

    // Lista todos os blocos de horário de um dentista específico.
    List<Agenda> findByDentistaIdDentista(Integer idDentista);
}
