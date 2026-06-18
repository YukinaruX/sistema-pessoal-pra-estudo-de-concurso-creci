import { useContext } from 'react';
import { AuthContext } from './authContext.js';

// Hook de conveniência para consumir o contexto de autenticação.
// O provider (AuthProvider) vive em authContext.jsx e envolve o app.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  }
  return ctx;
}
