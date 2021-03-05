import React from 'react';
import { render } from 'react-dom';
import App from '@layouts/App';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

render(
  <BrowserRouter>
    <App />
    <ToastContainer />
  </BrowserRouter>,
  document.querySelector('#app')
);

// pages - 서비스 페이지
// components - 짜잘 컴포넌트
// layouts - 공통 레이아웃
