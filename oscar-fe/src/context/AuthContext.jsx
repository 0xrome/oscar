import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebaseConfig';
// 1. Define the AuthContext and its default value
export const AuthContext = createContext({
    user: null,
});
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);
    return (<AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>);
};
export const useAuth = () => useContext(AuthContext);
