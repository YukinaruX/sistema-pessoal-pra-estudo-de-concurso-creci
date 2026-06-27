import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock, Target, RefreshCw, FileText, ArrowRight,
  Flame, Trophy, TrendingUp, BookOpen,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { tentativaFromRow, planoFromRow } from '../lib/mappers.js';
import { diasAteProva } from '../lib/estatisticas.js';
import { paraDataISO } from '../lib/leitner.js';
import { corDisciplina } from '../styles/theme.js';
import { useAuth } from '../hooks/useAuth.js';
import Loading from '../components/shared/Loading.jsx';

// ─────────────────────────────────────────────
//  Hook base: anima 0 → target via RAF (sempre funciona)
// ─────────────────────────────────────────────
function useRafAnimate(target, duracaoMs = 750, delayMs = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    let rafId;
    const timerId = setTimeout(() => {
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / duracaoMs, 1);
        setVal((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) rafId = requestAnimationFrame(tick);
        else        setVal(target);
      };
      rafId = requestAnimationFrame(tick);
    }, delayMs);
    return () => { clearTimeout(timerId); cancelAnimationFrame(rafId); };
  }, [target, duracaoMs, delayMs]);
  return val;
}

// ─────────────────────────────────────────────
//  Contador de número (ex: 0 → 75.3%)
// ─────────────────────────────────────────────
function useCountUp(alvo, duracaoMs = 950) {
  const str    = String(alvo ?? '');
  const temPct = str.endsWith('%');
  const num    = parseFloat(str.replace('%', ''));
  const valid  = !isNaN(num);
  const animated = useRafAnimate(valid ? num : 0, duracaoMs);
  if (!valid) return str;
  const dec = temPct && str.includes('.') ? (str.split('.')[1]?.length ?? 0) : 0;
  const fmt = dec > 0 ? animated.toFixed(dec) : String(Math.round(animated));
  return temPct ? `${fmt}%` : fmt;
}

// ─────────────────────────────────────────────
//  Página principal
// ─────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const nome         = user?.user_metadata?.nome || user?.email?.split('@')[0] || 'estudante';
  const primeiroNome = nome.split(' ')[0];

  const [carregando, setCarregando] = useState(true);
  const [dados, setDados]           = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setCarregando(true);
        const hoje = paraDataISO(new Date());
        const [tentRes, planoRes, cardsRes] = await Promise.all([
          supabase.from('tentativas').select('*').eq('user_id', user.id)
            .eq('status', 'finalizado').order('finalizado_em', { ascending: false }).limit(10),
          supabase.from('planos_estudo').select('*, plano_itens(status)').eq('user_id', user.id).limit(1),
          supabase.from('revisao_cards').select('caixa, proxima_revisao').eq('user_id', user.id),
        ]);
        const recentes = (tentRes.data || []).map(tentativaFromRow);
        const tentIds  = recentes.slice(0, 5).map(t => t.id);
        const { data: respData } = tentIds.length > 0
          ? await supabase.from('respostas')
              .select('correta, questoes!questao_id(disciplina)')
              .in('tentativa_id', tentIds)
          : { data: [] };

        const plano      = planoRes.data?.[0] ? planoFromRow(planoRes.data[0]) : null;
        const todosCards = cardsRes.data || [];
        const mediaRecentes = recentes.length > 0
          ? +(recentes.reduce((s, t) => s + (t.percentual || 0), 0) / recentes.length).toFixed(1)
          : null;
        const cardsVencidos = todosCards.filter(c => c.proxima_revisao <= hoje).length;
        const sequencia     = calcularSequencia(recentes);
        const caixas = [1, 2, 3, 4, 5].map(n => ({ n, total: todosCards.filter(c => c.caixa === n).length }));

        const mapaDisc = {};
        (respData || []).forEach(r => {
          const d = r.questoes?.disciplina;
          if (!d) return;
          if (!mapaDisc[d]) mapaDisc[d] = { certas: 0, total: 0 };
          mapaDisc[d].total++;
          if (r.correta) mapaDisc[d].certas++;
        });
        const disciplinas = Object.entries(mapaDisc)
          .map(([n, v]) => ({ nome: n, certas: v.certas, total: v.total, pct: v.total ? Math.round((v.certas / v.total) * 100) : 0 }))
          .sort((a, b) => b.pct - a.pct);

        const itensPlano = planoRes.data?.[0]?.plano_itens || [];
        const planoStats = {
          total:      itensPlano.length,
          concluidos: itensPlano.filter(i => i.status === 'concluido').length,
          andamento:  itensPlano.filter(i => i.status === 'em_andamento').length,
        };
        setDados({ recentes, mediaRecentes, dias: diasAteProva(plano?.dataProva), cardsVencidos, sequencia, caixas, disciplinas, planoStats });
      } catch (err) { console.error(err); }
      finally      { setCarregando(false); }
    })();
  }, [user.id]);

  if (carregando) return <Loading texto="Montando seu painel…" />;
  if (!dados)     return null;

  const { recentes, mediaRecentes, dias, cardsVencidos, sequencia, caixas, disciplinas, planoStats } = dados;

  return (
    <div className="grid" style={{ gap: 22 }}>

      {/* Saudação + streak */}
      <div className="slide-esq" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 30 }}>Olá, {primeiroNome}! 👋</h1>
          <p className="muted-sm" style={{ marginTop: 4 }}>Pronto para mais um dia de estudos para o CRECI-BA?</p>
        </div>
        {sequencia > 0 && (
          <div className="pop" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--laranja)', color: '#fff',
            padding: '8px 18px', borderRadius: 'var(--raio-pill)',
            fontWeight: 800, fontSize: 15,
            border: '2px solid #cc7a00', borderBottom: '4px solid #cc7a00',
          }}>
            <Flame size={18} /> {sequencia} {sequencia === 1 ? 'dia' : 'dias'} em sequência
          </div>
        )}
      </div>

      {/* Métricas */}
      <div className="grid surgir-lista" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(165px,1fr))' }}>
        <CardMetrica icon={CalendarClock} cor="var(--azul-info)"
          valor={dias == null ? '—' : dias >= 0 ? dias : 'Passou'}
          rotulo={dias == null ? 'Defina a data da prova' : dias >= 0 ? 'dias até a prova' : 'data da prova'}
          to="/plano" />
        <CardMetrica icon={Target}    cor="var(--verde)"   valor={mediaRecentes == null ? '—' : `${mediaRecentes}%`} rotulo="média dos simulados"    to="/historico" />
        <CardMetrica icon={RefreshCw} cor="var(--laranja)" valor={cardsVencidos}  rotulo="cards de revisão hoje"   to="/revisao"  />
        <CardMetrica icon={Trophy}    cor="var(--amarelo)" valor={recentes.length} rotulo="simulados finalizados"  to="/historico" />
      </div>

      {/* CTA */}
      <Link to="/simulado" className="card surgir pulse-cta"
        style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', background: 'var(--gradiente)', border: 'none', textDecoration: 'none', animationDelay: '0.18s' }}
      >
        <FileText size={36} color="#fff" />
        <div style={{ flex: 1, minWidth: 180 }}>
          <h2 style={{ fontSize: 19, color: '#fff' }}>Continuar simulado</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 }}>Progresso salvo — volte de onde parou.</p>
        </div>
        <span className="btn" style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.35)', borderBottomColor: 'rgba(0,0,0,0.15)', color: '#ffffff' }}>
          Abrir <ArrowRight size={16} />
        </span>
      </Link>

      {/* Gráficos */}
      {recentes.length > 1 && (
        <div className="surgir grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, animationDelay: '0.08s' }}>
          <GraficoEvolucao tentativas={[...recentes].reverse().slice(-7)} />
          <GraficoRosca tentativa={recentes[0]} />
        </div>
      )}

      {/* Disciplinas */}
      {disciplinas.length > 0 && (
        <div className="card surgir" style={{ animationDelay: '0.12s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <TrendingUp size={17} color="var(--azul-info)" />
            <h3 style={{ fontSize: 15 }}>Desempenho por disciplina</h3>
            <span className="muted-sm">(últimos 5 simulados)</span>
          </div>
          <GraficoDisciplinas disciplinas={disciplinas} />
        </div>
      )}

      {/* Leitner + Plano */}
      {(caixas.some(c => c.total > 0) || planoStats.total > 0) && (
        <div className="surgir grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, animationDelay: '0.16s' }}>
          {caixas.some(c => c.total > 0) && <CaixasLeitner caixas={caixas} />}
          {planoStats.total > 0 && <ProgressoPlano stats={planoStats} />}
        </div>
      )}

      {/* Acesso rápido */}
      <div className="grid surgir-lista" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', animationDelay: '0.2s' }}>
        <AcessoRapido to="/historico" icon={Trophy}    titulo="Histórico"        desc={`${recentes.length} simulados finalizados`} />
        <AcessoRapido to="/plano"     icon={BookOpen}  titulo="Plano de estudos" desc="Organize seu cronograma" />
        <AcessoRapido to="/revisao"   icon={RefreshCw} titulo="Revisão de erros" desc="Repetição espaçada Leitner" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  CardMetrica com contador
// ─────────────────────────────────────────────
function CardMetrica({ icon: Icon, cor, valor, rotulo, to }) {
  const display = useCountUp(valor);
  const exibir  = ['—', 'Passou'].includes(String(valor)) ? valor : display;
  return (
    <Link to={to} className="card pop" style={{ borderLeft: `4px solid ${cor}`, textDecoration: 'none' }}>
      <Icon size={22} color={cor} />
      <div style={{ fontSize: 36, fontWeight: 900, fontFamily: 'var(--fonte-titulo)', marginTop: 8, lineHeight: 1, color: 'var(--tinta)', fontVariantNumeric: 'tabular-nums' }}>
        {exibir}
      </div>
      <div className="muted-sm" style={{ marginTop: 5 }}>{rotulo}</div>
    </Link>
  );
}

// ─────────────────────────────────────────────
//  Gráfico de linha com curva suave + clip-path animado
// ─────────────────────────────────────────────
function GraficoEvolucao({ tentativas }) {
  if (tentativas.length < 2) return null;

  const W = 460, H = 160;
  const PAD = { top: 28, right: 20, bottom: 32, left: 44 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top  - PAD.bottom;

  const pts   = tentativas.map(t => t.percentual ?? 0);
  const xOf   = i => PAD.left + (i / (pts.length - 1)) * cw;
  const yOf   = v => PAD.top  + (1 - v / 100) * ch;
  const coords = pts.map((v, i) => ({ x: xOf(i), y: yOf(v), v }));

  // Curva bezier suave
  const linhaD = coords.map((p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    const prev = coords[i - 1];
    const cpx  = ((prev.x + p.x) / 2).toFixed(1);
    return `C ${cpx} ${prev.y.toFixed(1)}, ${cpx} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }).join(' ');

  const base  = PAD.top + ch;
  const areaD = `${linhaD} L${coords[coords.length-1].x.toFixed(1)} ${base} L${coords[0].x.toFixed(1)} ${base} Z`;

  // clipWidth cresce de 0 até cw via RAF — revela linha da esquerda p/ direita
  const clipW  = useRafAnimate(cw + 20, 1200, 60);
  const grids  = [0, 50, 100];
  const gradId = 'grad-evo-' + pts.length; // id único

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <TrendingUp size={15} color="var(--verde)" />
        <h3 style={{ fontSize: 14 }}>Evolução do aproveitamento</h3>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#58cc02" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#58cc02" stopOpacity="0.02" />
          </linearGradient>
          <clipPath id="clip-evo">
            <rect x={PAD.left - 4} y={0} width={clipW} height={H + 10} />
          </clipPath>
        </defs>

        {/* Gridlines */}
        {grids.map(g => (
          <g key={g}>
            <line x1={PAD.left} y1={yOf(g)} x2={W - PAD.right} y2={yOf(g)}
              stroke="var(--cisne)" strokeWidth="1" strokeDasharray="4 3" />
            <text x={PAD.left - 6} y={yOf(g) + 4} textAnchor="end" fontSize="11" fill="var(--lobo)">{g}%</text>
          </g>
        ))}

        {/* Área + linha — recortadas pelo clip animado */}
        <path d={areaD} fill={`url(#${gradId})`} clipPath="url(#clip-evo)" />
        <path d={linhaD} fill="none" stroke="var(--verde)" strokeWidth="3"
          strokeLinejoin="round" strokeLinecap="round"
          clipPath="url(#clip-evo)"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(88,204,2,0.35))' }}
        />

        {/* Pontos — aparecem quando o clip os revela */}
        {coords.map((c, i) => {
          const revealX = c.x - PAD.left + 4;   // posição relativa ao início do clip
          const visible = clipW >= revealX;
          return (
            <g key={i} style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.2s ease-out' }}>
              <circle cx={c.x} cy={c.y} r="5.5"
                fill="var(--verde)" stroke="var(--neve)" strokeWidth="2.5"
                style={{ filter: 'drop-shadow(0 1px 3px rgba(88,204,2,0.5))' }}
              />
              <text x={c.x} y={c.y - 11} textAnchor="middle"
                fontSize="11" fontWeight="800" fill="var(--tinta)">{c.v}%</text>
              <text x={c.x} y={H - 2} textAnchor="middle"
                fontSize="11" fill="var(--lobo)">{i + 1}</text>
            </g>
          );
        })}
      </svg>
      <p className="muted-sm" style={{ textAlign: 'center', marginTop: 4, fontSize: 11 }}>
        Simulados em ordem cronológica
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Gráfico rosca — segmentos via RAF
// ─────────────────────────────────────────────
const CIRC = 2 * Math.PI * 52; // ≈ 326.7

function SegmentoArco({ cx, cy, r, sw, comprimento, offset, cor, delay }) {
  const dashLen = useRafAnimate(comprimento, 700, delay);
  return (
    <circle cx={cx} cy={cy} r={r} fill="none"
      stroke={cor} strokeWidth={sw} strokeLinecap="butt"
      strokeDasharray={`${dashLen} ${CIRC}`}
      strokeDashoffset={offset}
    />
  );
}

function GraficoRosca({ tentativa }) {
  if (!tentativa) return null;
  const C = tentativa.totalCertas  ?? 0;
  const E = tentativa.totalErradas ?? 0;
  const B = tentativa.totalBrancos ?? 0;
  const total = C + E + B;
  if (total === 0) return null;

  const CX = 70, CY = 70, R = 52, SW = 15;
  const segs = [
    { val: C, cor: '#58cc02', delay: 0   },
    { val: E, cor: '#ff4b4b', delay: 280 },
    { val: B, cor: '#c8c8c8', delay: 520 },
  ].filter(s => s.val > 0);

  let acum = 0;
  const arcos = segs.map(s => {
    const len  = (s.val / total) * CIRC;
    const item = { ...s, len, offset: -acum + CIRC / 4 };
    acum += len;
    return item;
  });

  const pct        = Math.round(tentativa.percentual ?? 0);
  const displayPct = useCountUp(pct, 900);

  const legenda = [
    { label: 'Certas',    val: C, cor: '#58cc02' },
    { label: 'Erradas',   val: E, cor: '#ff4b4b' },
    { label: 'Em branco', val: B, cor: '#c8c8c8' },
  ].filter(l => l.val > 0);

  return (
    <div className="card">
      <h3 style={{ fontSize: 14, marginBottom: 16 }}>Último simulado</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <svg viewBox="0 0 140 140" style={{ width: 130, height: 130, flexShrink: 0 }}>
          {/* Trilha */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--cisne)" strokeWidth={SW} />
          {/* Segmentos animados */}
          {arcos.map((a, i) => (
            <SegmentoArco key={i} cx={CX} cy={CY} r={R} sw={SW}
              comprimento={a.len} offset={a.offset} cor={a.cor} delay={a.delay} />
          ))}
          {/* Centro */}
          <text x={CX} y={CY - 4} textAnchor="middle" fontSize="22" fontWeight="900" fill="var(--tinta)"
            fontFamily="var(--fonte-titulo)">{displayPct}%</text>
          <text x={CX} y={CY + 14} textAnchor="middle" fontSize="11" fill="var(--lobo)">aproveitamento</text>
        </svg>
        <div style={{ display: 'grid', gap: 10 }}>
          {legenda.map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 13, height: 13, borderRadius: 4, background: l.cor, flexShrink: 0 }} />
              <span style={{ fontWeight: 800, fontSize: 17 }}>{l.val}</span>
              <span className="muted-sm" style={{ fontSize: 13 }}>{l.label}</span>
            </div>
          ))}
          {tentativa.tempoSegundos > 0 && (
            <p className="muted-sm" style={{ fontSize: 11, marginTop: 2 }}>Tempo: {fmtTempo(tentativa.tempoSegundos)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Barra animada via RAF (sem depender de CSS transition)
// ─────────────────────────────────────────────
function BarraRaf({ pct, cor, delay = 0, altura = 10 }) {
  const width = useRafAnimate(pct, 750, delay);
  return (
    <div className="progresso-trilha" style={{ height: altura }}>
      <div style={{
        height: '100%', borderRadius: 'var(--raio-pill)',
        background: cor, width: `${width}%`,
        transition: 'none',
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────
//  Disciplinas
// ─────────────────────────────────────────────
function GraficoDisciplinas({ disciplinas }) {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {disciplinas.map((d, i) => (
        <div key={d.nome}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{d.nome}</span>
            <span style={{ fontWeight: 800, fontSize: 13, color: corDisciplina(d.nome) }}>
              {d.pct}% <span className="muted-sm" style={{ fontWeight: 400 }}>({d.certas}/{d.total})</span>
            </span>
          </div>
          <BarraRaf pct={d.pct} cor={corDisciplina(d.nome)} delay={i * 80} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Caixas Leitner
// ─────────────────────────────────────────────
const COR_CAIXA   = ['#ff4b4b', '#ff9600', '#ffc800', '#1cb0f6', '#58cc02'];
const LABEL_CAIXA = ['Iniciando', 'Aprendendo', 'Praticando', 'Dominando', 'Dominado'];

function CaixasLeitner({ caixas }) {
  const max        = Math.max(...caixas.map(c => c.total), 1);
  const totalCards = caixas.reduce((s, c) => s + c.total, 0);
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <RefreshCw size={15} color="var(--laranja)" />
        <h3 style={{ fontSize: 14 }}>Caixas de revisão</h3>
        <span className="muted-sm">({totalCards} cards)</span>
      </div>
      <div style={{ display: 'grid', gap: 9 }}>
        {caixas.map((c, i) => (
          <div key={c.n}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: COR_CAIXA[c.n - 1] }}>Cx {c.n} — {LABEL_CAIXA[c.n - 1]}</span>
              <span style={{ fontSize: 12, fontWeight: 800 }}>{c.total}</span>
            </div>
            <BarraRaf pct={(c.total / max) * 100} cor={COR_CAIXA[c.n - 1]} delay={i * 70} altura={8} />
          </div>
        ))}
      </div>
      <Link to="/revisao" className="muted-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 14, color: 'var(--verde)', fontWeight: 700, textDecoration: 'none' }}>
        Revisar agora <ArrowRight size={13} />
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Progresso do plano
// ─────────────────────────────────────────────
function ProgressoPlano({ stats }) {
  const pct       = stats.total > 0 ? Math.round((stats.concluidos / stats.total) * 100) : 0;
  const pendentes = stats.total - stats.concluidos - stats.andamento;
  const displayPct = useCountUp(pct, 900);

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <BookOpen size={15} color="var(--azul-info)" />
        <h3 style={{ fontSize: 14 }}>Progresso do plano</h3>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 48, fontWeight: 900, fontFamily: 'var(--fonte-titulo)', color: 'var(--tinta)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {displayPct}
        </span>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--lobo)' }}>%</span>
        <p className="muted-sm" style={{ marginTop: 3 }}>concluído</p>
      </div>
      <BarraRaf pct={pct} cor="var(--verde)" delay={50} altura={12} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, textAlign: 'center', marginTop: 14 }}>
        <MiniStat val={stats.concluidos} label="Concluídos" cor="var(--verde)"   delay={0}   />
        <MiniStat val={stats.andamento}  label="Andamento"  cor="var(--laranja)" delay={100} />
        <MiniStat val={pendentes}        label="Pendentes"  cor="var(--lobo)"    delay={200} />
      </div>
      <Link to="/plano" className="muted-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 14, color: 'var(--verde)', fontWeight: 700, textDecoration: 'none' }}>
        Ver plano <ArrowRight size={13} />
      </Link>
    </div>
  );
}

function MiniStat({ val, label, cor, delay }) {
  const animated = useRafAnimate(val, 800, delay);
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 900, color: cor, fontVariantNumeric: 'tabular-nums' }}>{Math.round(animated)}</div>
      <div className="muted-sm" style={{ fontSize: 11 }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Acesso rápido
// ─────────────────────────────────────────────
function AcessoRapido({ to, icon: Icon, titulo, desc }) {
  return (
    <Link to={to} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
      <Icon size={20} style={{ color: 'var(--lobo)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ fontSize: 14 }}>{titulo}</strong>
        <div className="muted-sm" style={{ marginTop: 2, fontSize: 12 }}>{desc}</div>
      </div>
      <ArrowRight size={16} style={{ color: 'var(--lobo)', flexShrink: 0 }} />
    </Link>
  );
}

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
function calcularSequencia(tentativas) {
  if (!tentativas.length) return 0;
  const datas = [...new Set(tentativas.map(t => new Date(t.finalizadoEm).toISOString().split('T')[0]))].sort().reverse();
  const hoje  = new Date(); hoje.setHours(0, 0, 0, 0);
  if (Math.floor((hoje - new Date(datas[0] + 'T00:00:00')) / 86400000) > 1) return 0;
  let seq = 1;
  for (let i = 1; i < datas.length; i++) {
    if (Math.floor((new Date(datas[i-1]+'T00:00:00') - new Date(datas[i]+'T00:00:00')) / 86400000) === 1) seq++;
    else break;
  }
  return seq;
}

function fmtTempo(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}min${sec > 0 ? ` ${sec}s` : ''}`;
}
