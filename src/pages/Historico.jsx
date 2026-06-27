import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ChevronRight, Inbox } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { tentativaFromRow } from '../lib/mappers.js';
import { formatarTempo } from '../lib/estatisticas.js';
import { useAuth } from '../hooks/useAuth.js';
import Loading from '../components/shared/Loading.jsx';

export default function Historico() {
  const { user } = useAuth();
  const [tentativas, setTentativas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setCarregando(true);
        const { data, error } = await supabase
          .from('tentativas')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'finalizado')
          .order('finalizado_em', { ascending: false });
        if (error) throw error;
        setTentativas((data || []).map(tentativaFromRow));
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    })();
  }, [user.id]);

  if (carregando) return <Loading texto="Carregando histórico…" />;
  if (erro) return <div className="card" style={{ borderColor: 'var(--erro)' }}>{erro}</div>;

  const melhor = tentativas.reduce((max, t) => Math.max(max, t.percentual || 0), 0);
  const media =
    tentativas.length > 0
      ? Math.round((tentativas.reduce((s, t) => s + (t.percentual || 0), 0) / tentativas.length) * 10) / 10
      : 0;

  return (
    <div className="grid" style={{ gap: 18 }}>
      <h1 className="slide-esq" style={{ fontSize: 28 }}>Histórico</h1>

      {tentativas.length === 0 ? (
        <div className="card surgir" style={{ textAlign: 'center', padding: 40 }}>
          <Inbox size={40} className="texto-fraco" style={{ marginBottom: 12 }} />
          <p>Você ainda não finalizou nenhum simulado.</p>
          <Link to="/simulado" className="btn btn-primario" style={{ marginTop: 16 }}>
            Começar agora
          </Link>
        </div>
      ) : (
        <>
          <div className="grid surgir-lista" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))' }}>
            <Mini valor={tentativas.length} rotulo="Simulados feitos" />
            <Mini valor={`${media}%`} rotulo="Média de acertos" />
            <Mini valor={`${melhor}%`} rotulo="Melhor resultado" />
          </div>

          <SparkLine pontos={[...tentativas].reverse().map((t) => t.percentual || 0)} />

          <div className="grid surgir-lista" style={{ gap: 10 }}>
            {tentativas.map((t) => (
              <Link
                key={t.id}
                to={`/resultado/${t.id}`}
                className="card"
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, textDecoration: 'none' }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 14,
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontFamily: 'var(--fonte-titulo)',
                    background: 'var(--gradiente)',
                  }}
                >
                  {Math.round(t.percentual || 0)}%
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{formatarData(t.finalizadoEm)}</div>
                  <div className="muted-sm">
                    {t.totalCertas}C · {t.totalErradas}E · {t.totalBrancos}B · {formatarTempo(t.tempoSegundos)}
                  </div>
                </div>
                <ChevronRight className="texto-fraco" />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Mini({ valor, rotulo }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--fonte-titulo)' }}>{valor}</div>
      <div className="muted-sm">{rotulo}</div>
    </div>
  );
}

// Gráfico de linha simples em SVG, sem dependências.
function SparkLine({ pontos }) {
  if (pontos.length < 2) return null;
  const w = 600;
  const h = 120;
  const pad = 10;
  const max = 100;
  const passo = (w - pad * 2) / (pontos.length - 1);
  const coords = pontos.map((p, i) => {
    const x = pad + i * passo;
    const y = h - pad - (p / max) * (h - pad * 2);
    return [x, y];
  });
  const d = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <TrendingUp size={18} color="var(--azul-claro)" />
        <strong style={{ fontSize: 15 }}>Evolução do aproveitamento</strong>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto' }}>
        <path d={`${d} L${pad + (pontos.length - 1) * passo},${h - pad} L${pad},${h - pad} Z`} fill="rgba(37,99,235,0.15)" />
        <path d={d} fill="none" stroke="var(--azul-claro)" strokeWidth="2.5" strokeLinejoin="round" />
        {coords.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5" fill="var(--azul-claro)" />
        ))}
      </svg>
    </div>
  );
}

function formatarData(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
