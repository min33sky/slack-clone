import React from 'react';
import { render } from 'react-dom';
import App from '@layouts/App';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // react-Toastify CSS

render(
  <BrowserRouter>
    <App />
    <ToastContainer />
  </BrowserRouter>,
  document.querySelector('#app')
);
