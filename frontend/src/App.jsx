import { NavLink, Route, Routes } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import ScannerPage from './pages/ScannerPage'

export default function App() {
  const classes = ({ isActive }) =>
    `px-4 py-2 rounded-lg ${isActive ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-slate-100'}`

  return (
    <div className="min-h-screen text-white p-6 bg-gradient-to-b from-slate-950 to-slate-900">
      <header className="max-w-5xl mx-auto mb-6">
        <h1 className="text-3xl font-bold mb-4">Image Recognition Product System</h1>
        <nav className="flex gap-3">
          <NavLink to="/" className={classes}>Admin</NavLink>
          <NavLink to="/scanner" className={classes}>Scanner</NavLink>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto">
        <Routes>
          <Route path="/" element={<AdminPage />} />
          <Route path="/scanner" element={<ScannerPage />} />
        </Routes>
      </main>
    </div>
  )
}
