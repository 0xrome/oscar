import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import Home from './components/Home'
import SignIn from './components/SignIn'
import { useAuth } from './context/AuthContext'
import Stats from 'components/Stats'
import Users from 'components/Users'
import BottomNav from 'components/BottomNav'
import Match from 'components/Match'

const App: React.FC = () => {
  const authContext = useAuth()

  console.log(authContext)
  if (!authContext) {
    // Handle the error or the scenario when the context is not provided.
    // You could return a loading spinner or a message or null.
    console.log('NO AUTH CONTEXT')
    console.log(authContext)
    return null
  }

  const { user } = authContext

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="p-10 rounded-3xl shadow-md">
        <Router>
          <Routes>
            <Route
              path="/"
              element={user ? <Home /> : <Navigate to="/signin" />}
            />
            <Route
              path="/signin"
              element={!user ? <SignIn /> : <Navigate to="/" />}
            />
            <Route
              path="/stats"
              element={user ? <Stats /> : <Navigate to="/signin" />}
            />
            <Route
              path="/users"
              element={user ? <Users /> : <Navigate to="/signin" />}
            />
            <Route
              path="/match"
              element={user ? <Match /> : <Navigate to="/match" />}
            />
          </Routes>
          {/* Persistent Bottom Navigation if user is authenticated */}
          {/* {user && <BottomNav />} */}
          <BottomNav />
        </Router>
      </div>
    </div>
  )
}

export default App
