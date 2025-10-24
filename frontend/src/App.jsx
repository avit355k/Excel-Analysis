import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home'
import Upload from './pages/Upload/Upload';
import Dashboard from './pages/Dashboard/Dashboard';
import Analytics from './pages/Analytics/Analytics';
import Reports from './pages/Reports/Reports';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" exact={true} element={<Home />} />
        <Route path="/dashboard" exact={true} element={<Dashboard />} />
        <Route path="/analytics" exact={true} element={<Analytics />} />
        <Route path="/reports" exact={true} element={<Reports />} />
        <Route path="/upload" exact={true} element={<Upload />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
