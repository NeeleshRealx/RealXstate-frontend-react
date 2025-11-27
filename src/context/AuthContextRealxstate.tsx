// src/context/AuthContext.tsx
import { deleteCookie, getCookie } from '@/utils/cookieUtils';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of the context
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Simulate a login function
  const login = (token: string, user: any) => {
    console.log(token, "token" )
    if(token){
    setIsAuthenticated(true);
    setIsLoading(false);
    setUser(user);
    }
 
    // In a real app, you would store the token in localStorage or session storage
     
  };

  // Simulate a logout function
  const logout = () => {
    setIsAuthenticated(false);
    setIsLoading(false);
    setUser(null);
    deleteCookie("token")
  };

  // Load authentication state from localStorage on initial render
  useEffect(() => {
    const token = getCookie("token")
    console.log(token,"token ")
    if (token) {
      setIsAuthenticated(true);
      setIsLoading(false);
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
