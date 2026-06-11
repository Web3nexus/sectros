import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'

import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { WebsiteThemeProvider } from './context/WebsiteThemeContext'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ErrorBoundary>
      <ThemeProvider>
        <WebsiteThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </WebsiteThemeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </BrowserRouter>
)
