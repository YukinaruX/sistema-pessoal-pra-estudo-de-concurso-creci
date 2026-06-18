import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Target, RefreshCw, FileText, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { tentativaFromRow, planoFromRow } from '../lib/mappers.js';
import { diasAteProva } from '../lib/estatisticas.js';
import { paraDataISO } from '../lib/leitner.js';
import { useAuth } from '../hooks/useAuth.js';
import Loading from '../components/shared/Loading.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [carregando, setCarregando] = useState(true);
  const [dados, setDados] = useState({ mediaRecentes: null, dias: null, cardsVencidos: 0, totalSimulados: 0 });

  useEffect(() => {
    (async () => {
      try {
        setCarregando(true);
        const hoje = paraDataISO(new Date());

        const [tent, plano, cards] = await Promise.all([
          supabase
            .from('tentativas')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'finalizado')
            .order('finalizado_em', { ascending: false })
            .limit(5),
          supabase.from('planos_estudo').select('*').eq('user_id', user.id).limit(1),
          supabase
            .from('revisao_cards')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .lte('proxima_revisao', hoje),
        ]);

        if (tent.error) throw tent.error;

        const recentes = (tent.data || []).map(tentativaFromRow);
        const mediaRecentes =
          recentes.length > 0
            ? Math.round((recentes.reduce((s, t) => s + (t.percentual || 0), 0) / recentes.length) * 10) / 10
            : null;

        const p = plano.data?.[0] ? planoFromRow(plano.data[0]) : null;

        setDados({
          mediaRecentes,
          dias: diasAteProva(p?.dataProva),
          cardsVencidos: cards.count || 0,
          totalSimulados: recentes.length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    })();
  }, [user.id]);

  if (carregando) return <Loading texto="Montando seu painel…" />;

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 30 }}>Olá! 👋</h1>
        <p className="muted-sm">Pronto para mais um dia de estudos para o CRECI-BA?</p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
        <CardMetrica
          icon={CalendarClock}
          cor="var(--azul-claro)"
          valor={dados.dias == null ? '—' : dados.dias >= 0 ? dados.dias : 'Passou'}
          rotulo={dados.dias == null ? 'Defina a data da prova' : dados.dias >= 0 ? 'dias até a prova' : 'data da prova'}
          to="/plano"
        />
        <CardMetrica
          icon={Target}
          cor="var(--sucesso)"
          valor={dados.mediaRecentes == null ? '—' : `${dados.mediaRecentes}%`}
          rotulo="média (últimos simulados)"
          to="/historico"
        />
        <CardMetrica
          icon={RefreshCw}
          cor="var(--alerta)"
          valor={dados.cardsVencidos}
          rotulo="cards de revisão hoje"
          to="/revisao"
        />
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', background: 'var(--gradiente)', border: 'none' }}>
        <FileText size={36} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: 20 }}>Continuar simulado</h2>
          <p style={{ opacity: 0.9, fontSize: 14 }}>
            Seu progresso é salvo automaticamente — pode parar e voltar de onde estava.
          </p>
        </div>
        <Link to="/simulado" className="btn btn-secundario" style={{ background: 'rgba(255,255,255,0.18)', borderColor: 'rgba(255,255,255,0.3)' }}>
          Abrir <ArrowRight size={17} />
        </Link>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
        <AcessoRapido to="/historico" titulo="Histórico" desc={`${dados.totalSimulados} simulados finalizados`} />
        <AcessoRapido to="/plano" titulo="Plano de estudos" desc="Organize seu cronograma" />
        <AcessoRapido to="/revisao" titulo="Revisão de erros" desc="Repetição espaçada (Leitner)" />
      </div>
    </div>
  );
}

function CardMetrica({ icon: Icon, cor, valor, rotulo, to }) {
  return (
    <Link to={to} className="card" style={{ borderLeft: `4px solid ${cor}` }}>
      <Icon size={24} color={cor} />
      <div style={{ fontSize: 34, fontWeight: 800, fontFamily: 'var(--fonte-titulo)', marginTop: 8, lineHeight: 1 }}>
        {valor}
      </div>
      <div className="muted-sm" style={{ marginTop: 4 }}>{rotulo}</div>
    </Link>
  );
}

function AcessoRapido({ to, titulo, desc }) {
  return (
    <Link to={to} className="card" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1 }}>
        <strong>{titulo}</strong>
        <div className="muted-sm">{desc}</div>
      </div>
      <ArrowRight size={18} className="texto-fraco" />
    </Link>
  );
}
