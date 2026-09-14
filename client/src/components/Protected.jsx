import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom';
import axios from 'axios'

const Protected = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [auth, setAuth] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
          withCredentials: true
        })
        setAuth(true)
      } catch (err) {
        console.error("PROTECTED AUTH FAILED:", err.response?.status, err.response?.data || err.message);
        setAuth(false)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  if (loading) return <div>Loading...</div>
  
  if (!auth) return <Navigate to="/" replace />

  return children
}

export default Protected
