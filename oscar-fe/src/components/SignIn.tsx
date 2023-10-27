// oscar-fe/src/components/SignIn.tsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in successfully');
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
