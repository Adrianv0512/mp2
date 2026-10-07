import './App.css'
import { Routes, Route, NavLink } from 'react-router-dom'
import List from './pages/list'
import Gallery from './pages/gallery'
import Detailed from './pages/detailed'

function App() {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <h2 className="app-name">Recipe Explorer</h2>
          <div className="nav-links">
            <NavLink
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              to="/meals"
            >
              List
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              to="/gallery"
            >
              Gallery
            </NavLink>
          </div>
        </div>
      </nav>

      <main className="app-content">
        <Routes>
          <Route path="/" element={<List />} />
          <Route path="/meals" element={<List />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/meal/:id" element={<Detailed />} />
        </Routes>
      </main>
    </>
  )
}

export default App
