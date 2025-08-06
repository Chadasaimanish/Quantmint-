import React, { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(dbService.isAuthenticated());

  const handleLogin = (email: string) => {
    dbService.login(email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    dbService.logout();
    setIsAuthenticated(false);
  };

  return (
    <>
      {isAuthenticated ? (
        <>
          <Header onLogout={handleLogout} />
          <main>
            <Dashboard />
          </main>
        </>
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </>
  );
};

export default App;
