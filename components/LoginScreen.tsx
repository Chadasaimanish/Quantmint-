import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { dbService } from '../services/dbService';

interface LoginScreenProps {
  onLogin: (email: string) => void;
}

const AtomIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17.25v-.933c0-.996.806-1.8 1.8-1.8h2.4c.994 0 1.8.804 1.8 1.8v.933m-6.002-3.666c.33-.223.694-.415 1.08-.573m-1.08.573a7.5 7.5 0 00-5.408 5.066m5.408-5.066c.153-.02.308-.035.464-.044m4.274 0c.156.009.31.024.464.044m-4.274 0a7.5 7.5 0 014.274 0M4.53 12.029a7.5 7.5 0 011.08-.573m-1.08.573a7.5 7.5 0 00-1.058 3.655m1.058-3.655a7.525 7.525 0 01-1.08-.573M15 4.75v.933c0 .996-.806 1.8-1.8 1.8h-2.4c-.994 0-1.8-.804-1.8-1.8V4.75" />
    </svg>
);


export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('demo@user.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isRegisterMode) {
        await dbService.registerUser(email, password);
        // Automatically log in after successful registration
        onLogin(email);
      } else {
        const success = await dbService.authenticateUser(email, password);
        if (success) {
          onLogin(email);
        } else {
          throw new Error('Invalid email or password.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <Card className="max-w-md w-full animate-slide-in-up">
        <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
                <AtomIcon />
            </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Quantum Budget Optimizer</h1>
          <p className="text-gray-400 mt-2">{isRegisterMode ? 'Create a new account.' : 'Sign in to access your dashboard.'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input id="email" label="Email Address" type="email" placeholder="user@domain.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input id="password" label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          
          {error && <p className="text-sm text-center text-error">{error}</p>}
          
          <Button type="submit" isLoading={isLoading}>
            {isLoading ? 'Authenticating...' : (isRegisterMode ? 'Register' : 'Sign In')}
          </Button>
          <p className="text-sm text-center text-gray-500">
            <button type="button" onClick={() => setIsRegisterMode(!isRegisterMode)} className="font-medium text-primary hover:underline">
              {isRegisterMode ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
          </p>
        </form>
      </Card>
    </div>
  );
};