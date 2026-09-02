// ============================================================
//  MeuPerfil.tsx — Área do psicólogo: os próprios dados
// ============================================================
// O psicólogo consulta e atualiza o próprio cadastro profissional. Repare que
// o CRP aparece apenas para leitura: alterá-lo é uma correção de cadastro e
// fica restrita ao administrador (regra verificada no back-end).

import { FormEvent, useEffect, useState } from 'react'
import * as api from '../api'
import { Psicologo } from '../tipos'
import { Erro, Sucesso } from '../componentes/Mensagens'

const AREAS = [
  'Clínica',
  'Organizacional e do Trabalho',
  'Escolar e Educacional',
  'Hospitalar',
  'Social',
  'Jurídica',
  'Do Esporte',
  'Do Trânsito',
  'Neuropsicologia',
  'Pesquisa e Docência',
]

export function MeuPerfil() {
  const [cadastro, setCadastro] = useState<Psicologo | null>(null)
  const [areaAtuacao, setAreaAtuacao] = useState('')
  const [abordagem, setAbordagem] = useState('')
  const [telefone, setTelefone] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    api
      .meuCadastroDePsicologo()
      .then((dados) => {
        setCadastro(dados)
        setAreaAtuacao(dados.areaAtuacao)
        setAbordagem(dados.abordagem ?? '')
        setTelefone(dados.telefone ?? '')
      })
      .catch((e) => setErro(e.message))
  }, [])

  async function salvar(evento: FormEvent) {
    evento.preventDefault()
    if (!cadastro) return
    setErro('')
    setSucesso('')
    try {
      const atualizado = await api.atualizarPsicologo(cadastro.idPsicologo, {
        areaAtuacao,
        abordagem: abordagem || null,
        telefone: telefone || null,
      })
      setCadastro(atualizado)
      setSucesso('Dados atualizados com sucesso.')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar os dados.')
    }
  }

  if (erro && !cadastro) return <Erro texto={erro} />
  if (!cadastro) return <p className="carregando">Carregando…</p>

  return (
    <div className="cartao">
      <h1>Meu perfil profissional</h1>
      <p className="subtitulo">{cadastro.usuario.nomeCompleto}</p>

      <Erro texto={erro} />
      <Sucesso texto={sucesso} />

      <form onSubmit={salvar} className="formulario">
        <div className="grade-campos">
          <div className="campo">
            <label htmlFor="crp-perfil">CRP</label>
            {/* readOnly: só o administrador altera o registro profissional. */}
            <input id="crp-perfil" value={cadastro.crp} readOnly />
            <small className="ajuda">Para corrigir o CRP, procure o administrador.</small>
          </div>

          <div className="campo">
            <label htmlFor="email-perfil">E-mail de acesso</label>
            <input id="email-perfil" value={cadastro.usuario.email} readOnly />
          </div>

          <div className="campo">
            <label htmlFor="area-perfil">Área de atuação</label>
            <select
              id="area-perfil"
              value={areaAtuacao}
              onChange={(e) => setAreaAtuacao(e.target.value)}
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="abordagem-perfil">Abordagem</label>
            <input
              id="abordagem-perfil"
              value={abordagem}
              onChange={(e) => setAbordagem(e.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="telefone-perfil">Telefone</label>
            <input
              id="telefone-perfil"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="botao-primario">
          Salvar alterações
        </button>
      </form>
    </div>
  )
}
