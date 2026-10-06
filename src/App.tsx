import './App.css'
import {Routes, Route, Link } from 'react-router-dom';
import List from './pages/list';
import Gallery from './pages/gallery';
import Detailed from './pages/detailed';

function App() {

  return (
    <>
        
      <nav>
        <h2>Recipe Explorer</h2>
        <div>
          <Link to="/meals">List</Link>
          <Link to="/gallery">Gallery</Link>
        </div>
      </nav>
      
      <Routes>
        <Route path="/" element={<List />} />
        <Route path="/meals" element={<List />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/meal/:id" element={<Detailed />} />
      </Routes>
    </>
      
  )
}

export default App
