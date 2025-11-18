import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/grapes.min.css'  // ✅ GrapesJS core styles
import './styles/theme.css'      // ✅ Enhanced theme styles
import '@fortawesome/fontawesome-free/css/all.min.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
