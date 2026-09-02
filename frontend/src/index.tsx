// Ponto de entrada do React: é o primeiro arquivo que roda no navegador.
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import App from './App'
import { ProvedorDeAutenticacao } from './contexto/Autenticacao'

const raiz = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

raiz.render(
  <React.StrictMode>
    {/* BrowserRouter habilita a navegação por endereços (/pacientes, /agenda...). */}
    <BrowserRouter>
      {/* O provedor deixa o usuário logado disponível para todas as telas. */}
      <ProvedorDeAutenticacao>
        <App />
      </ProvedorDeAutenticacao>
    </BrowserRouter>
  </React.StrictMode>
)
