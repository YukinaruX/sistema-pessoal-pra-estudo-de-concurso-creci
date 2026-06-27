import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { supabaseConfigurado } from '../lib/supabaseClient.js';
import Logo from '../components/shared/Logo.jsx';

export default function Login() {
  const { user, carregando, entrar, cadastrar, resetarSenha } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const destino   = location.state?.from || '/';

  // 'login' | 'cadastro' | 'recuperar'
  const [modo, setModo]       = useState('login');
  const [nome, setNome]       = useState('');
  const [email, setEmail]     = useState('');
  const [senha, setSenha]     = useState('');
  const [erro, setErro]       = useState(null);
  const [aviso, setAviso]     = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [agitando, setAgitando] = useState(false);

  if (!carregando && user) return <Navigate to={destino} replace />;

  function trocarModo(novoModo) {
    if (novoModo === modo) return;
    setModo(novoModo);
    setErro(null);
    setAviso(null);
    setNome('');
  }

  function sacudir() {
    setAgitando(true);
    setTimeout(() => setAgitando(false), 600);
  }

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

      } else if (modo === 'cadastro') {
        const { data, error } = await cadastrar(email, senha, nome);
        if (error) throw error;
        if (data.session) {
          navigate(destino, { replace: true });
        } else {
          setAviso('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
          trocarModo('login');
        }

      } else {
        // recuperar senha
        const { error } = await resetarSenha(email);
        if (error) throw error;
        setAviso('E-mail enviado! Verifique sua caixa de entrada e clique no link para redefinir a senha.');
      }
    } catch (err) {
      setErro(traduzErro(err.message));
      sacudir();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-bg">
      <div
        className={`card surgir${agitando ? ' sacudir' : ''}`}
        style={{ width: '100%', maxWidth: 420, padding: 32 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div className="pop" style={{ display: 'inline-block', marginBottom: 14 }}>
            <Logo size={62} />
          </div>
          <h1 style={{ fontSize: 24 }}>Estudos CRECI-BA</h1>
          <p className="muted-sm" style={{ marginTop: 5 }}>
            {modo === 'login'     && 'Entre para continuar seus estudos'}
            {modo === 'cadastro'  && 'Crie sua conta gratuita'}
            {modo === 'recuperar' && 'Recupere o acesso à sua conta'}
          </p>
        </div>

        {!supabaseConfigurado && (
          <div style={avisoBox('var(--alerta)')}>
            Supabase não configurado. Preencha <code>.env</code> com{' '}
            <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>.
          </div>
        )}

        {/* ── Tabs (login / cadastro) ── */}
        {modo !== 'recuperar' && (
          <div style={{ display: 'flex', marginBottom: 24, borderBottom: '2px solid var(--cisne)' }}>
            <TabBtn ativo={modo === 'login'}    onClick={() => trocarModo('login')}>Entrar</TabBtn>
            <TabBtn ativo={modo === 'cadastro'} onClick={() => trocarModo('cadastro')}>Cadastrar</TabBtn>
          </div>
        )}

        {/* ── Cabeçalho modo recuperar ── */}
        {modo === 'recuperar' && (
          <button
            type="button"
            onClick={() => trocarModo('login')}
            className="surgir"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--lobo)', fontWeight: 700, fontSize: 13,
              marginBottom: 20, padding: 0,
            }}
          >
            <ArrowLeft size={15} /> Voltar ao login
          </button>
        )}

        {/* ── Formulário — key força re-mount ao trocar modo ── */}
        <form key={modo} onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>

          {/* Nome — só no cadastro */}
          {modo === 'cadastro' && (
            <div className="surgir" style={{ animationDuration: '0.22s' }}>
              <label className="campo">
                <User size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> Nome
              </label>
              <input
                className="input" type="text" value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                required autoComplete="name" autoFocus
              />
            </div>
          )}

          {/* E-mail */}
          <div className="surgir" style={{ animationDelay: modo === 'cadastro' ? '0.06s' : '0s' }}>
            <label className="campo">
              <Mail size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> E-mail
            </label>
            <input
              className="input" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              required autoComplete="email"
              autoFocus={modo !== 'cadastro'}
            />
          </div>

          {/* Senha — login e cadastro */}
          {modo !== 'recuperar' && (
            <div className="surgir" style={{ animationDelay: modo === 'cadastro' ? '0.12s' : '0.06s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label className="campo" style={{ margin: 0 }}>
                  <Lock size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> Senha
                </label>
                {modo === 'login' && (
                  <button
                    type="button"
                    onClick={() => trocarModo('recuperar')}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--verde)', fontWeight: 700, fontSize: 12,
                      fontFamily: 'var(--fonte)', padding: 0,
                    }}
                  >
                    Esqueci a senha
                  </button>
                )}
              </div>
              <input
                className="input" type="password" value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••" required minLength={6}
                autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
          )}

          {erro  && <div className="surgir" style={avisoBox('var(--erro)')}>{erro}</div>}
          {aviso && <div className="surgir" style={avisoBox('var(--sucesso)')}>{aviso}</div>}

          <button
            className="btn btn-primario surgir"
            type="submit"
            disabled={enviando}
            style={{
              width: '100%', marginTop: 4,
              animationDelay: modo === 'cadastro' ? '0.18s' : modo === 'recuperar' ? '0.06s' : '0.12s',
            }}
          >
            {enviando ? (
              <><span className="spinner-mini" /> Aguarde…</>
            ) : modo === 'login' ? 'Entrar'
              : modo === 'cadastro' ? 'Criar conta'
              : <><Send size={15} /> Enviar link de recuperação</>}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Componentes auxiliares ── */

function TabBtn({ ativo, onClick, children }) {
  return (
    <button
      type="button" onClick={onClick}
      style={{
        flex: 1, padding: '10px 0',
        fontFamily: 'var(--fonte-titulo)', fontWeight: 800, fontSize: 14,
        border: 'none',
        borderBottom: `3px solid ${ativo ? 'var(--verde)' : 'transparent'}`,
        marginBottom: '-2px',
        background: 'transparent',
        color: ativo ? 'var(--verde)' : 'var(--lobo)',
        cursor: 'pointer',
        transition: 'color 0.2s, border-color 0.2s',
      }}
    >
      {children}
    </button>
  );
}

function avisoBox(cor) {
  return {
    fontSize: 13, fontWeight: 600, padding: '10px 14px',
    borderRadius: 'var(--raio-sm)', border: `2px solid ${cor}`,
    background: `${cor}18`, color: 'var(--tinta)',
  };
}

function traduzErro(msg = '') {
  if (/invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.';
  if (/already registered/i.test(msg))        return 'Este e-mail já está cadastrado.';
  if (/password should be at least/i.test(msg)) return 'A senha deve ter ao menos 6 caracteres.';
  if (/rate limit/i.test(msg))                return 'Muitas tentativas. Aguarde alguns minutos.';
  return msg || 'Algo deu errado. Tente novamente.';
}
