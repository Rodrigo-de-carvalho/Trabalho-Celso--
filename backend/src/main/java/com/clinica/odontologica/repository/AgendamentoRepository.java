package com.clinica.odontologica.repository;

import com.clinica.odontologica.entity.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/**
 * Repository do Agendamento.
 *
 * Tem um método extra para verificar se um dentista já tem horário ocupado,
 * impedindo dois agendamentos no mesmo dentista e na mesma data/hora.
 */
@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Integer> {

    // Verifica se já existe agendamento para ESTE dentista NAQUELA data/hora exata.
    // O Spring entende "DentistaIdDentista" como: navegue até o objeto dentista e
    // compare o campo idDentista dele.
    boolean existsByDentistaIdDentistaAndDataHora(Integer idDentista, LocalDateTime dataHora);

    // Mesma verificação, mas ignorando o próprio agendamento (usado quando editamos um).
    boolean existsByDentistaIdDentistaAndDataHoraAndIdAgendamentoNot(
            Integer idDentista, LocalDateTime dataHora, Integer idAgendamento);
}
