import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'  // Этот файл импортирует App.css
import App from './App'
import './App.css' // Можно также импортировать напрямую здесь

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)