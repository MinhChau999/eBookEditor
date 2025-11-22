import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/grapes.min.css'  // ✅ GrapesJS core styles
import './styles/setup.css'
import './index.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
