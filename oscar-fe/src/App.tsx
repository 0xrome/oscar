import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './components/HomePage';
import SignIn from './components/SignIn';
import { useAuth } from './context/AuthContext';

const App: React.FC = () => {
  const authContext = useAuth();

console.log(authContext);
if (!authContext) {
    // Handle the error or the scenario when the context is not provided. 
    // You could return a loading spinner or a message or null.
    console.log("NO AUTH CONTEXT");
    console.log(authContext);
    return null;
}

const { user } = authContext;


  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <HomePage /> : <Navigate to="/signin" />} />
        <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;