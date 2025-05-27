import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    const storedAuth = localStorage.getItem("authState");
    return storedAuth ? JSON.parse(storedAuth) : { token: null, user: null };
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleOIDCCallback = (token, user) => {
    const newAuthState = { 
      token, 
      user,
      timestamp: Date.now() 
    };
    setAuthState(newAuthState);
    localStorage.setItem("authState", JSON.stringify(newAuthState));
  };

  const logout = () => {
    setAuthState({ token: null, user: null });
    localStorage.removeItem("authState");
  };

  const isTokenExpired = () => {
    if (!authState.timestamp) return true;
    const TOKEN_EXPIRY_TIME =  300 * 1000; // 5 minutes in milliseconds
    return Date.now() - authState.timestamp > TOKEN_EXPIRY_TIME;
  };

  return (
    <AuthContext.Provider value={{ 
      authState, 
      handleOIDCCallback, 
      logout, 
      loading,
      isTokenExpired
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
