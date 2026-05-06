import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Booking Manager
          </h1>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800">
            Admin
          </span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-6 py-8">
        <aside className="hidden w-52 shrink-0 md:block">
          <nav className="space-y-1">
            {['Dashboard', 'Bookings', 'Rooms', 'Guests', 'Settings'].map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-white hover:text-slate-900 hover:shadow-sm"
                >
                  {item}
                </button>
              ),
            )}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-500">
              React + Vite + Tailwind CSS
            </p>
            <p className="mt-2 text-slate-700">
              Edit <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-800">src/App.jsx</code>{' '}
              and save to test HMR.
            </p>
            <button
              type="button"
              className="mt-6 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
              onClick={() => setCount((c) => c + 1)}
            >
              Count is {count}
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
