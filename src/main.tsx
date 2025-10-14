import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from "./components/theme-provider"
import { StatusProvider } from "./contexts/StatusContext"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <StatusProvider>
        <App />
      </StatusProvider>
    </ThemeProvider>
  </StrictMode>,
)
