import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/AuthProvider.jsx';
import ProtectedRoute from './components/shared/ProtectedRoute.jsx';
import Layout from './components/shared/Layout.jsx';
import Loading from './components/shared/Loading.jsx';

// Páginas carregadas sob demanda (code splitting) — reduz o bundle inicial e
// acelera o primeiro carregamento; cada rota só baixa o que precisa.
const Login              = lazy(() => import('./pages/Login.jsx'));
const RedefinirSenha     = lazy(() => import('./pages/RedefinirSenha.jsx'));
const Dashboard          = lazy(() => import('./pages/Dashboard.jsx'));
const Simulado           = lazy(() => import('./pages/Simulado.jsx'));
const ResultadoTentativa = lazy(() => import('./pages/ResultadoTentativa.jsx'));
const Historico          = lazy(() => import('./pages/Historico.jsx'));
const PlanoEstudos       = lazy(() => import('./pages/PlanoEstudos.jsx'));
const Revisao            = lazy(() => import('./pages/Revisao.jsx'));
const Jogos              = lazy(() => import('./pages/Jogos.jsx'));
const QuizRelampago      = lazy(() => import('./pages/QuizRelampago.jsx'));
const Sobrevivencia      = lazy(() => import('./pages/Sobrevivencia.jsx'));
const JogoMemoria        = lazy(() => import('./pages/JogoMemoria.jsx'));
const TrilhaSaber        = lazy(() => import('./pages/TrilhaSaber.jsx'));

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
              <Route path="/jogos" element={<Jogos />} />
              <Route path="/jogos/quiz-relampago" element={<QuizRelampago />} />
              <Route path="/jogos/sobrevivencia" element={<Sobrevivencia />} />
              <Route path="/jogos/memoria" element={<JogoMemoria />} />
              <Route path="/jogos/trilha" element={<TrilhaSaber />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
