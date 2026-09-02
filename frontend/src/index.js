// Ponto de entrada do React: é o primeiro arquivo JavaScript que roda.
// Importa a biblioteca principal do React.
import React from 'react';
// Importa a biblioteca de renderização do React no navegador.
import ReactDOM from 'react-dom/client';
// BrowserRouter habilita a navegação entre telas (rotas) sem recarregar a página.
import { BrowserRouter } from 'react-router-dom';
// Importa o arquivo de estilo css.
import './index.css';
// Importa o componente principal do aplicativo.
import App from './App';
import reportWebVitals from './reportWebVitals';

// Pega a <div id="root"> do index.html e "monta" o React dentro dela.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Envolvemos o App no BrowserRouter para o react-router-dom funcionar. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Mede a performance do app (não usamos isso na apresentação, é só padrão do create-react-app).
reportWebVitals();
