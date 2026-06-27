import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import Logo from '../components/shared/Logo.jsx';

export default function RedefinirSenha() {
  const navigate = useNavigate();

  const [novaSenha, setNovaSenha]   = useState('');
  const [confirmar, setConfirmar]   = useState('');
  const [enviando, setEnviando]     = useState(false);
  const [erro, setErro]             = useState(null);
  const [sucesso, setSucesso]       = useState(false);
  const [agitando, setAgitando]     = useState(false);

  // Supabase processa o token da URL automaticamente e emite PASSWORD_RECOVERY.
  // Guardamos se o evento foi recebido para habilitar o formulário.
  const [tokenOk, setTokenOk] = useState(false);

  useEffect(() => {
    // Verifica sessão já ativa (token processado antes do mount)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setTokenOk(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setTokenOk(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  function sacudir() {
    setAgitando(true);
    setTimeout(() => setAgitando(false), 600);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (novaSenha !== confirmar) {
      setErro('As senhas não coincidem.');
      sacudir();
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;
      setSucesso(true);
      // Redireciona ao login após 3 s
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      setErro(err.message || 'Erro ao redefinir a senha.');
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
          <h1 style={{ fontSize: 22 }}>
            {sucesso ? 'Senha redefinida!' : 'Criar nova senha'}
          </h1>
          <p className="muted-sm" style={{ marginTop: 5 }}>
            {sucesso
              ? 'Você será redirecionado para o login em instantes…'
              : 'Escolha uma senha segura com no mínimo 6 caracteres.'}
          </p>
        </div>

        {/* ── Estado: sucesso ── */}
        {sucesso && (
          <div className="surgir" style={{ textAlign: 'center', padding: '16px 0 8px' }}>
            <CheckCircle2 size={52} color="var(--verde)" style={{ marginBottom: 12 }} />
            <p style={{ fontWeight: 700, color: 'var(--tinta)' }}>Senha alterada com sucesso!</p>
            <p className="muted-sm" style={{ marginTop: 6 }}>Redirecionando para o login…</p>
          </div>
        )}

        {/* ── Estado: token inválido / expirado ── */}
        {!sucesso && !tokenOk && (
          <div className="surgir" style={{ textAlign: 'center', padding: '16px 0 8px' }}>
            <AlertCircle size={48} color="var(--laranja)" style={{ marginBottom: 12 }} />
            <p style={{ fontWeight: 700 }}>Link inválido ou expirado</p>
            <p className="muted-sm" style={{ marginTop: 6, lineHeight: 1.6 }}>
              O link de recuperação pode ter expirado ou já foi utilizado.
              Solicite um novo link na tela de login.
            </p>
            <Link
              to="/login"
              className="btn btn-primario"
              style={{ marginTop: 20, display: 'inline-flex' }}
            >
              Voltar ao login
            </Link>
          </div>
        )}

        {/* ── Formulário: só exibe quando o token é válido ── */}
        {!sucesso && tokenOk && (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>

            <div className="surgir">
              <label className="campo">
                <Lock size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> Nova senha
              </label>
              <input
                className="input" type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="••••••••" required minLength={6} autoFocus
                autoComplete="new-password"
              />
            </div>

            <div className="surgir" style={{ animationDelay: '0.07s' }}>
              <label className="campo">
                <Lock size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> Confirmar senha
              </label>
              <input
                className="input" type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                placeholder="••••••••" required minLength={6}
                autoComplete="new-password"
              />
            </div>

            {/* Indicador de força da senha */}
            {novaSenha.length > 0 && (
              <ForcaSenha senha={novaSenha} />
            )}

            {erro && <div className="surgir" style={avisoBox('var(--erro)')}>{erro}</div>}

            <button
              className="btn btn-primario surgir"
              type="submit" disabled={enviando}
              style={{ width: '100%', marginTop: 4, animationDelay: '0.14s' }}
            >
              {enviando
                ? <><span className="spinner-mini" /> Aguarde…</>
                : 'Salvar nova senha'}
            </button>

            <p className="muted-sm surgir" style={{ textAlign: 'center', animationDelay: '0.18s' }}>
              <Link to="/login" style={{ color: 'var(--verde)', fontWeight: 700 }}>
                Cancelar e voltar ao login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

/* Indicador visual de força da senha */
function ForcaSenha({ senha }) {
  const forca = calcularForca(senha);
  const cores  = ['var(--vermelho)', 'var(--laranja)', 'var(--amarelo)', 'var(--verde)'];
  const labels = ['Muito fraca', 'Fraca', 'Boa', 'Forte'];

  return (
    <div className="surgir" style={{ animationDuration: '0.2s' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 4, borderRadius: 99,
              background: i <= forca ? cores[forca] : 'var(--cisne)',
              transition: 'background 0.25s',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: cores[forca] }}>
        {labels[forca]}
      </span>
    </div>
  );
}

function calcularForca(senha) {
  let pts = 0;
  if (senha.length >= 8)          pts++;
  if (/[A-Z]/.test(senha))        pts++;
  if (/[0-9]/.test(senha))        pts++;
  if (/[^A-Za-z0-9]/.test(senha)) pts++;
  return Math.min(pts, 3);
}

function avisoBox(cor) {
  return {
    fontSize: 13, fontWeight: 600, padding: '10px 14px',
    borderRadius: 'var(--raio-sm)', border: `2px solid ${cor}`,
    background: `${cor}18`, color: 'var(--tinta)',
  };
}
