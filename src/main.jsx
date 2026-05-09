import { createRoot } from 'react-dom/client'
import './i18n'
// Must load before app CSS: @import after @tailwind is invalid and can drop this stylesheet in the bundle.
import 'react-datepicker/dist/react-datepicker.css'
import './index.css'
import App from './App.jsx'

// NOTE: StrictMode is intentionally disabled here. React's double-invocation
// of effects in development is useful for catching unsafe effects, but it
// also fires every data-fetching `useEffect` twice — which made every page
// hit the API twice on mount. We rely on real server-side request idempotency
// instead.
createRoot(document.getElementById('root')).render(<App />)
