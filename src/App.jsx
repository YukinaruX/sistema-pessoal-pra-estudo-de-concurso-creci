import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/AuthProvider.jsx';
import ProtectedRoute from './components/shared/ProtectedRoute.jsx';
import Layout from './components/shared/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Simulado from './pages/Simulado.jsx';
import ResultadoTentativa from './pages/ResultadoTentativa.jsx';
import Historico from './pages/Historico.jsx';
import PlanoEstudos from './pages/PlanoEstudos.jsx';
import Revisao from './pages/Revisao.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/simulado" element={<Simulado />} />
            <Route path="/resultado/:id" element={<ResultadoTentativa />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/plano" element={<PlanoEstudos />} />
            <Route path="/revisao" element={<Revisao />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
