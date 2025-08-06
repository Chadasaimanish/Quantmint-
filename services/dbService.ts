import type { FinancialData, User } from '../types';
import { INITIAL_FINANCIAL_DATA } from '../constants';

const AUTH_KEY = 'quantum-budget-auth';
const USERS_KEY = 'quantum-budget-users';
const CURRENT_USER_EMAIL_KEY = 'quantum-budget-current-user';
const DATA_KEY_PREFIX = 'quantum-budget-data-';

const _getUsers = (): User[] => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    if (users) {
      return JSON.parse(users);
    }
  } catch (e) {
    console.error('Failed to parse users from localStorage', e);
  }
  // Seed with a default user if none exist
  const initialUsers: User[] = [{ email: 'demo@user.com', password: 'password' }];
  localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
  return initialUsers;
};

const _saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
};

const _getCurrentUserEmail = (): string | null => {
    try {
        return localStorage.getItem(CURRENT_USER_EMAIL_KEY);
    } catch (e) {
        return null;
    }
}

export const dbService = {
  // --- Auth ---
  isAuthenticated: (): boolean => {
    try {
      return localStorage.getItem(AUTH_KEY) === 'true' && _getCurrentUserEmail() !== null;
    } catch (e) {
      return false;
    }
  },

  registerUser: (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = _getUsers();
        if (users.find(u => u.email === email)) {
          return reject(new Error('User with this email already exists.'));
        }
        const newUser = { email, password };
        users.push(newUser);
        _saveUsers(users);
        resolve(newUser);
      }, 500);
    });
  },

  authenticateUser: (email: string, password: string): Promise<boolean> => {
     return new Promise((resolve) => {
        setTimeout(() => {
            const users = _getUsers();
            const user = users.find(u => u.email === email && u.password === password);
            resolve(!!user);
        }, 500);
     });
  },

  login: (email: string): void => {
    try {
      localStorage.setItem(AUTH_KEY, 'true');
      localStorage.setItem(CURRENT_USER_EMAIL_KEY, email);
    } catch (e) {
      console.error('Failed to set auth keys in localStorage', e);
    }
  },

  logout: (): void => {
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
    } catch (e) {
      console.error('Failed to remove auth keys from localStorage', e);
    }
  },

  // --- Data ---
  saveFinancialData: (data: FinancialData): void => {
    const email = _getCurrentUserEmail();
    if (!email) {
      console.error("Cannot save data. No user is logged in.");
      return;
    }
    try {
      const dataKey = `${DATA_KEY_PREFIX}${email}`;
      localStorage.setItem(dataKey, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save data to localStorage', e);
    }
  },

  loadFinancialData: (): FinancialData => {
    const email = _getCurrentUserEmail();
    if (!email) {
      // Should not happen in an authenticated context, but as a fallback:
      return INITIAL_FINANCIAL_DATA;
    }
    
    try {
      const dataKey = `${DATA_KEY_PREFIX}${email}`;
      const storedData = localStorage.getItem(dataKey);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.income !== undefined && parsed.expenses) {
          return parsed as FinancialData;
        }
      }
    } catch (e) {
      console.error('Failed to load data from localStorage', e);
    }
    
    // If no data exists for this user, create, save, and return initial data.
    const initialDataForUser = { ...INITIAL_FINANCIAL_DATA };
    dbService.saveFinancialData(initialDataForUser);
    return initialDataForUser;
  },
};
