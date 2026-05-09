import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.jsx'

// NOTE: StrictMode is intentionally disabled here. React's double-invocation
// of effects in development is useful for catching unsafe effects, but it
// also fires every data-fetching `useEffect` twice — which made every page
// hit the API twice on mount. We rely on real server-side request idempotency
// instead.
createRoot(document.getElementById('root')).render(<App />)
