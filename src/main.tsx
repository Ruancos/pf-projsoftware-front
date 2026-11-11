import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <Auth0Provider
    domain="dev-vfg70dt6c81j6ppt.us.auth0.com"
    clientId="s4ASMoMrV78QqE0nuV80kR0kUEDTGqjJ"
    authorizationParams={{ redirect_uri: window.location.origin }}
  >
    <App />
  </Auth0Provider>
)
