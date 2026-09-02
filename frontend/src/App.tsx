// ============================================================
//  App.tsx — Define as ROTAS (telas) do sistema
// ============================================================
// O mapa de navegação do produto. Tudo, exceto o login, fica dentro de
// <RotaProtegida>, e as telas restritas informam quais perfis podem abri-las.
//
// Lembrete importante: esta proteção serve para a EXPERIÊNCIA do usuário.
// A proteção que de fato importa está no back-end — mesmo que alguém burlasse
// esta tela, a API continuaria recusando a operação.

import { Route, Routes } from 'react-router-dom'

import { Layout } from './componentes/Layout'
import { RotaProtegida } from './componentes/RotaProtegida'

import { Login } from './paginas/Login'
import { Painel } from './paginas/Painel'
import { Usuarios } from './paginas/Usuarios'
import { Psicologos } from './paginas/Psicologos'
import { Pacientes } from './paginas/Pacientes'
import { Agenda } from './paginas/Agenda'
import { MeuPerfil } from './paginas/MeuPerfil'
import { Auditoria } from './paginas/Auditoria'

export default function App() {
  return (
    <Routes>
      {/* Única tela pública. */}
      <Route path="/login" element={<Login />} />

      {/* Todas as telas internas compartilham o mesmo menu (Layout). */}
      <Route
        element={
          <RotaProtegida>
            <Layout />
          </RotaProtegida>
        }
      >
        <Route path="/" element={<Painel />} />
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/agenda" element={<Agenda />} />

        {/* Telas exclusivas do administrador. */}
        <Route
          path="/usuarios"
          element={
            <RotaProtegida perfis={['Administrador']}>
              <Usuarios />
            </RotaProtegida>
          }
        />
        <Route
          path="/psicologos"
          element={
            <RotaProtegida perfis={['Administrador']}>
              <Psicologos />
            </RotaProtegida>
          }
        />
        <Route
          path="/auditoria"
          element={
            <RotaProtegida perfis={['Administrador']}>
              <Auditoria />
            </RotaProtegida>
          }
        />

        {/* Tela exclusiva do psicólogo. */}
        <Route
          path="/meu-perfil"
          element={
            <RotaProtegida perfis={['Psicologo']}>
              <MeuPerfil />
            </RotaProtegida>
          }
        />
      </Route>

      {/* Qualquer endereço desconhecido volta para o painel. */}
      <Route path="*" element={<RotaProtegida><Painel /></RotaProtegida>} />
    </Routes>
  )
}
