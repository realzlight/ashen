import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Project from './pages/Project.jsx'
import Protected from './components/Protected.jsx'

import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={
          <Protected>
            <Dashboard />
          </Protected>
        }/>
        <Route path="/dashboard/:name" element={
          <Protected>
            <Project />
          </Protected>
        }/>
      </Routes>
    </div>
  )
}

export default App
