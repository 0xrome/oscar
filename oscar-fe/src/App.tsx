import React from 'react';
import { AuthProvider } from './context/AuthContext';
import SignIn from './components/SignIn';

const App: React.FC = () => {
  return (
    <AuthProvider>
      {/* Other components */}
      <SignIn />
      {/* Other components */}
    </AuthProvider>
  );
};

export default App;