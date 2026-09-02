package com.clinica.odontologica.repository;

import com.clinica.odontologica.entity.PlanoOdontologico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository do Plano Odontológico.
 *
 * O Repository é a camada que CONVERSA COM O BANCO. A gente nem precisa escrever
 * SQL: ao estender JpaRepository, já ganhamos de graça métodos prontos como
 * save() (inserir/atualizar), findAll() (listar), findById() (buscar por id)
 * e deleteById() (apagar).
 */
// @Repository marca esta interface como um componente de acesso a dados do Spring.
@Repository
// JpaRepository<Tipo da Entidade, Tipo da chave primária>. Aqui: PlanoOdontologico e Integer.
public interface PlanoOdontologicoRepository extends JpaRepository<PlanoOdontologico, Integer> {
}
