import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../config/firebaseConfig'
import { User } from 'firebase/auth'

interface AuthContextProps {
  user: User | null
}

// 1. Define the AuthContext and its default value
export const AuthContext = createContext<AuthContextProps | undefined>({
  user: null,
})

// 2. Define a type for the AuthProvider props
type AuthProviderProps = {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
