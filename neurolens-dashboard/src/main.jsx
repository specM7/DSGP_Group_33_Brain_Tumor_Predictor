import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const inIframe = typeof window !== 'undefined' && window !== window.top;
const isClerkValid = PUBLISHABLE_KEY && !PUBLISHABLE_KEY.includes("YOUR_CLERK") && !inIframe;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      {isClerkValid ? (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
          <App />
        </ClerkProvider>
      ) : (
        <App />
      )}
    </ThemeProvider>
  </StrictMode>,
)
