import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { supabaseConfigurado } from '../lib/supabaseClient.js';

export default function Login() {
  const { user, carregando, entrar, cadastrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.from || '/';

  const [modo, setModo] = useState('login'); // 'login' | 'cadastro'
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);

  if (!carregando && user) return <Navigate to={destino} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    setEnviando(true);
    try {
      if (modo === 'login') {
        const { error } = await entrar(email, senha);
        if (error) throw error;
        navigate(destino, { replace: true });
      } else {
        const { data, error } = await cadastrar(email, senha);
        if (error) throw error;
        if (data.session) {
          navigate(destino, { replace: true });
        } else {
          setAviso('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
          setModo('login');
        }
      }
    } catch (err) {
      setErro(traduzErro(err.message));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
      }}
    >
      <div className="card surgir" style={{ width: '100%', maxWidth: 420, padding: 30 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'var(--gradiente)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 8px 22px rgba(37,99,235,0.4)',
            }}
          >
            <GraduationCap size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: 24 }}>Estudos CRECI-BA</h1>
          <p className="muted-sm" style={{ marginTop: 4 }}>
            {modo === 'login' ? 'Entre para continuar seus estudos' : 'Crie sua conta'}
          </p>
        </div>

        {!supabaseConfigurado && (
          <div style={avisoBox('var(--alerta)')}>
            Supabase não configurado. Preencha <code>.env</code> com{' '}
            <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label className="campo">
              <Mail size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> E-mail
            </label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              required
              autoComplete="email"
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label className="campo">
              <Lock size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> Senha
            </label>
            <input
              className="input"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {erro && <div style={avisoBox('var(--erro)')}>{erro}</div>}
          {aviso && <div style={avisoBox('var(--sucesso)')}>{aviso}</div>}

          <button className="btn btn-primario" type="submit" disabled={enviando} style={{ width: '100%' }}>
            {enviando ? 'Aguarde…' : modo === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <p className="muted-sm" style={{ textAlign: 'center', marginTop: 18 }}>
          {modo === 'login' ? 'Ainda não tem conta?' : 'Já tem conta?'}{' '}
          <button
            type="button"
            onClick={() => {
              setModo(modo === 'login' ? 'cadastro' : 'login');
              setErro(null);
              setAviso(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--azul-claro)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {modo === 'login' ? 'Cadastre-se' : 'Faça login'}
          </button>
        </p>
      </div>
    </div>
  );
}

function avisoBox(cor) {
  return {
    fontSize: 13,
    padding: '10px 12px',
    borderRadius: 'var(--raio-sm)',
    border: `1px solid ${cor}`,
    background: 'rgba(255,255,255,0.04)',
    color: 'var(--texto)',
    marginBottom: 14,
  };
}

function traduzErro(msg = '') {
  if (/invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.';
  if (/already registered/i.test(msg)) return 'Este e-mail já está cadastrado.';
  if (/password should be at least/i.test(msg)) return 'A senha deve ter ao menos 6 caracteres.';
  return msg || 'Algo deu errado. Tente novamente.';
}
