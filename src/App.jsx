import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/AuthProvider.jsx';
import ProtectedRoute from './components/shared/ProtectedRoute.jsx';
import Layout from './components/shared/Layout.jsx';
import Loading from './components/shared/Loading.jsx';

// Páginas carregadas sob demanda (code splitting) — reduz o bundle inicial e
// acelera o primeiro carregamento; cada rota só baixa o que precisa.
const Login         = lazy(() => import('./pages/Login.jsx'));
const RedefinirSenha = lazy(() => import('./pages/RedefinirSenha.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Simulado = lazy(() => import('./pages/Simulado.jsx'));
const ResultadoTentativa = lazy(() => import('./pages/ResultadoTentativa.jsx'));
const Historico = lazy(() => import('./pages/Historico.jsx'));
const PlanoEstudos = lazy(() => import('./pages/PlanoEstudos.jsx'));
const Revisao = lazy(() => import('./pages/Revisao.jsx'));

// Aplica o tema salvo antes do primeiro render (evita flash de tema errado).
const temaSalvo = localStorage.getItem('tema') ?? 'escuro';
document.documentElement.dataset.theme = temaSalvo;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading texto="Carregando…" minHeight="100vh" />}>
          <Routes>
            <Route path="/login"            element={<Login />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
