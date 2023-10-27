// oscar-fe/src/components/SignIn.tsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { useAuth } from '../context/AuthContext';


const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const authContext = useAuth();
  if (!authContext) {
    // Handle the error or the scenario when the context is not provided. 
    // You could return a loading spinner or a message or null.
    console.log("NO AUTH CONTEXT");
    console.log(authContext);
    return null;
}
  const { user } = authContext;


  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in successfully');
      console.log(authContext);
      console.log(user);

    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center join">
      <input
        type="email"
        placeholder="Email"
        className="input input-bordered input-md w-full max-w-xs join-item"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input 
        type="password"
        placeholder="Password"
        className="input input-bordered input-md w-full max-w-xs join-item"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
       className="btn join-item btn-primary"
       onClick={handleSignIn}>Sign In</button>
    </div>
  );
};

export default SignIn;
