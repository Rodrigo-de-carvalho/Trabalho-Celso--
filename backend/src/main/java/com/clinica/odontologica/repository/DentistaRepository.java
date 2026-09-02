package com.clinica.odontologica.repository;

import com.clinica.odontologica.entity.Dentista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository do Dentista.
 *
 * Tem métodos extras para garantir que CRO e e-mail sejam únicos.
 */
@Repository
public interface DentistaRepository extends JpaRepository<Dentista, Integer> {

    // Checa se já existe um dentista com este CRO (registro profissional).
    boolean existsByCro(String cro);

    // Mesma checagem, mas ignorando o próprio dentista (usado na edição).
    boolean existsByCroAndIdDentistaNot(String cro, Integer idDentista);

    // Checa se já existe um dentista com este e-mail.
    boolean existsByEmail(String email);

    boolean existsByEmailAndIdDentistaNot(String email, Integer idDentista);
}
