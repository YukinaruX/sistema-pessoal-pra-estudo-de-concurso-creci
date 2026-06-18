import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Loading from './Loading.jsx';

// Bloqueia rotas para usuários não autenticados, preservando o destino
// para redirecionar de volta após o login.
export default function ProtectedRoute({ children }) {
  const { user, carregando } = useAuth();
  const location = useLocation();

  if (carregando) return <Loading texto="Verificando sessão…" minHeight="100vh" />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
