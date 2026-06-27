import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Target, RefreshCw, FileText, ArrowRight, Flame, Trophy, TrendingUp, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { tentativaFromRow, planoFromRow } from '../lib/mappers.js';
import { diasAteProva } from '../lib/estatisticas.js';
import { paraDataISO } from '../lib/leitner.js';
import { corDisciplina } from '../styles/theme.js';
import { useAuth } from '../hooks/useAuth.js';
import Loading from '../components/shared/Loading.jsx';

// ─────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const nome = user?.user_metadata?.nome || user?.email?.split('@')[0] || 'estudante';
  const primeiroNome = nome.split(' ')[0];

  const [carregando, setCarregando] = useState(true);
  const [dados, setDados] = useState(null);

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

        // Respostas das últimas 5 tentativas para breakdown por disciplina
        const tentIds = recentes.slice(0, 5).map(t => t.id);
        const { data: respData } = tentIds.length > 0
          ? await supabase.from('respostas')
              .select('correta, questoes!questao_id(disciplina)')
              .in('tentativa_id', tentIds)
          : { data: [] };

        const plano = planoRes.data?.[0] ? planoFromRow(planoRes.data[0]) : null;
        const todosCards = cardsRes.data || [];

        const mediaRecentes = recentes.length > 0
          ? +(recentes.reduce((s, t) => s + (t.percentual || 0), 0) / recentes.length).toFixed(1)
          : null;

        const cardsVencidos = todosCards.filter(c => c.proxima_revisao <= hoje).length;
        const sequencia     = calcularSequencia(recentes);

        const caixas = [1, 2, 3, 4, 5].map(n => ({
          n,
          total: todosCards.filter(c => c.caixa === n).length,
        }));

        // Agrupamento por disciplina
        const mapaDisc = {};
        (respData || []).forEach(r => {
          const d = r.questoes?.disciplina;
          if (!d) return;
          if (!mapaDisc[d]) mapaDisc[d] = { certas: 0, total: 0 };
          mapaDisc[d].total++;
          if (r.correta) mapaDisc[d].certas++;
        });
        const disciplinas = Object.entries(mapaDisc)
          .map(([nome, v]) => ({ nome, certas: v.certas, total: v.total, pct: v.total ? Math.round((v.certas / v.total) * 100) : 0 }))
          .sort((a, b) => b.pct - a.pct);

        const itensPlano  = planoRes.data?.[0]?.plano_itens || [];
        const planoStats  = {
          total:        itensPlano.length,
          concluidos:   itensPlano.filter(i => i.status === 'concluido').length,
          andamento:    itensPlano.filter(i => i.status === 'em_andamento').length,
        };

        setDados({ recentes, mediaRecentes, dias: diasAteProva(plano?.dataProva), cardsVencidos, sequencia, caixas, disciplinas, planoStats });
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    })();
  }, [user.id]);

  if (carregando) return <Loading texto="Montando seu painel…" />;
  if (!dados) return null;

  const { recentes, mediaRecentes, dias, cardsVencidos, sequencia, caixas, disciplinas, planoStats } = dados;
  const ultimaTent = recentes[0] ?? null;
  const temDados   = recentes.length > 1;

  return (
    <div className="grid" style={{ gap: 22 }}>

      {/* ── Saudação + streak ── */}
      <div className="slide-esq" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 30 }}>Olá, {primeiroNome}! 👋</h1>
          <p className="muted-sm" style={{ marginTop: 4 }}>Pronto para mais um dia de estudos para o CRECI-BA?</p>
        </div>
        {sequencia > 0 && (
          <div style={{
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

      {/* ── 4 métricas ── */}
      <div className="grid surgir-lista" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(165px,1fr))' }}>
        <CardMetrica icon={CalendarClock} cor="var(--azul-info)"
          valor={dias == null ? '—' : dias >= 0 ? dias : 'Passou'}
          rotulo={dias == null ? 'Defina a data da prova' : dias >= 0 ? 'dias até a prova' : 'data da prova'}
          to="/plano" />
        <CardMetrica icon={Target} cor="var(--verde)"
          valor={mediaRecentes == null ? '—' : `${mediaRecentes}%`}
          rotulo="média dos simulados" to="/historico" />
        <CardMetrica icon={RefreshCw} cor="var(--laranja)"
          valor={cardsVencidos}
          rotulo="cards de revisão hoje" to="/revisao" />
        <CardMetrica icon={Trophy} cor="var(--amarelo)"
          valor={recentes.length}
          rotulo="simulados finalizados" to="/historico" />
      </div>

      {/* ── CTA simulado ── */}
      <Link to="/simulado" className="card surgir pulse-cta"
        style={{
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
          background: 'var(--gradiente)', border: 'none', textDecoration: 'none',
          animationDelay: '0.18s',
        }}
      >
        <FileText size={36} color="#fff" />
        <div style={{ flex: 1, minWidth: 180 }}>
          <h2 style={{ fontSize: 19, color: '#fff' }}>Continuar simulado</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 }}>
            Progresso salvo — volte de onde parou.
          </p>
        </div>
        <span className="btn" style={{
          background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.35)',
          borderBottomColor: 'rgba(0,0,0,0.15)', color: '#ffffff',
        }}>
          Abrir <ArrowRight size={16} />
        </span>
      </Link>

      {/* ── Gráficos: evolução + rosca ── */}
      {temDados && (
        <div className="surgir grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, animationDelay: '0.08s' }}>
          <GraficoEvolucao tentativas={[...recentes].reverse().slice(-7)} />
          {ultimaTent && <GraficoRosca tentativa={ultimaTent} />}
        </div>
      )}

      {/* ── Disciplinas ── */}
      {disciplinas.length > 0 && (
        <div className="card surgir" style={{ animationDelay: '0.12s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp size={17} color="var(--azul-info)" />
            <h3 style={{ fontSize: 15 }}>Desempenho por disciplina</h3>
            <span className="muted-sm" style={{ marginLeft: 4 }}>(últimos 5 simulados)</span>
          </div>
          <div style={{ display: 'grid', gap: 14 }}>
            {disciplinas.map(d => (
              <div key={d.nome}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{d.nome}</span>
                  <span style={{ fontWeight: 800, fontSize: 13, color: corDisciplina(d.nome) }}>
                    {d.pct}% <span className="muted-sm" style={{ fontWeight: 400 }}>({d.certas}/{d.total})</span>
                  </span>
                </div>
                <div className="progresso-trilha" style={{ height: 10 }}>
                  <div className="progresso-barra" style={{ width: `${d.pct}%`, background: corDisciplina(d.nome) }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Linha de baixo: Leitner + Plano ── */}
      {(caixas.some(c => c.total > 0) || planoStats.total > 0) && (
        <div className="surgir grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, animationDelay: '0.16s' }}>
          {caixas.some(c => c.total > 0) && <CaixasLeitner caixas={caixas} />}
          {planoStats.total > 0 && <ProgressoPlano stats={planoStats} />}
        </div>
      )}

      {/* ── Acesso rápido (sempre visível) ── */}
      <div className="grid surgir-lista" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', animationDelay: '0.2s' }}>
        <AcessoRapido to="/historico" icon={Trophy}   titulo="Histórico"         desc={`${recentes.length} simulados finalizados`} />
        <AcessoRapido to="/plano"     icon={BookOpen}  titulo="Plano de estudos"  desc="Organize seu cronograma" />
        <AcessoRapido to="/revisao"   icon={RefreshCw} titulo="Revisão de erros"  desc="Repetição espaçada Leitner" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Gráfico de linha — evolução do aproveitamento
// ─────────────────────────────────────────────
function GraficoEvolucao({ tentativas }) {
  if (tentativas.length < 2) return null;

  const W = 440, H = 148;
  const PAD = { top: 22, right: 16, bottom: 28, left: 40 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;

  const pts = tentativas.map(t => t.percentual ?? 0);
  const xOf = i => PAD.left + (pts.length > 1 ? (i / (pts.length - 1)) * cw : cw / 2);
  const yOf = v => PAD.top + (1 - v / 100) * ch;

  const linhaD = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(' ');
  const areaD  = `${linhaD} L${xOf(pts.length - 1)},${(PAD.top + ch).toFixed(1)} L${xOf(0)},${(PAD.top + ch).toFixed(1)} Z`;

  const grids = [0, 50, 100];

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <TrendingUp size={15} color="var(--verde)" />
        <h3 style={{ fontSize: 14 }}>Evolução do aproveitamento</h3>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="grad-evo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#58cc02" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#58cc02" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grid horizontal */}
        {grids.map(g => (
          <g key={g}>
            <line x1={PAD.left} y1={yOf(g)} x2={W - PAD.right} y2={yOf(g)}
              stroke="var(--cisne)" strokeWidth="1" strokeDasharray="4 3" />
            <text x={PAD.left - 5} y={yOf(g) + 4} textAnchor="end"
              fontSize="10" fill="var(--lobo)">{g}%</text>
          </g>
        ))}

        {/* Área preenchida */}
        <path d={areaD} fill="url(#grad-evo)" />

        {/* Linha */}
        <path d={linhaD} fill="none" stroke="var(--verde)" strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" />

        {/* Pontos + rótulos */}
        {pts.map((v, i) => (
          <g key={i}>
            <circle cx={xOf(i)} cy={yOf(v)} r="4.5"
              fill="var(--verde)" stroke="var(--neve)" strokeWidth="2" />
            {/* Valor acima do ponto — alterna para não sobrepor */}
            <text x={xOf(i)} y={yOf(v) - (i % 2 === 0 ? 9 : -16)} textAnchor="middle"
              fontSize="10" fontWeight="700" fill="var(--tinta)">{v}%</text>
            {/* Rótulo X */}
            <text x={xOf(i)} y={H - 4} textAnchor="middle"
              fontSize="10" fill="var(--lobo)">{i + 1}</text>
          </g>
        ))}
      </svg>
      <p className="muted-sm" style={{ textAlign: 'center', marginTop: 2 }}>Simulados (do mais antigo ao mais recente)</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Gráfico rosca — último simulado
// ─────────────────────────────────────────────
function GraficoRosca({ tentativa }) {
  const c = tentativa.totalCertas  ?? 0;
  const e = tentativa.totalErradas ?? 0;
  const b = tentativa.totalBrancos ?? 0;
  const total = c + e + b;
  if (total === 0) return null;

  const pctC = (c / total) * 100;
  const pctE = (e / total) * 100;
  const pctB = (b / total) * 100;

  const gradiente = `conic-gradient(
    var(--verde)   0%          ${pctC}%,
    var(--vermelho) ${pctC}%   ${pctC + pctE}%,
    var(--cisne)   ${pctC + pctE}% 100%
  )`;

  const legenda = [
    { label: 'Certas',    val: c, cor: 'var(--verde)' },
    { label: 'Erradas',   val: e, cor: 'var(--vermelho)' },
    { label: 'Em branco', val: b, cor: 'var(--cisne)' },
  ].filter(l => l.val > 0);

  return (
    <div className="card">
      <h3 style={{ fontSize: 14, marginBottom: 16 }}>Último simulado</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        {/* Rosca CSS */}
        <div style={{ position: 'relative', width: 116, height: 116, borderRadius: '50%', background: gradiente, flexShrink: 0 }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--neve)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontWeight: 900, fontSize: 19, lineHeight: 1, color: 'var(--tinta)' }}>
              {Math.round(tentativa.percentual ?? 0)}%
            </span>
            <span className="muted-sm" style={{ fontSize: 10, marginTop: 1 }}>acerto</span>
          </div>
        </div>

        {/* Legenda */}
        <div style={{ display: 'grid', gap: 10 }}>
          {legenda.map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 13, height: 13, borderRadius: 4, background: l.cor, border: l.cor === 'var(--cisne)' ? '1.5px solid var(--lobo)' : 'none', flexShrink: 0 }} />
              <div>
                <span style={{ fontWeight: 800, fontSize: 16 }}>{l.val}</span>
                <span className="muted-sm" style={{ marginLeft: 5, fontSize: 13 }}>{l.label}</span>
              </div>
            </div>
          ))}
          <p className="muted-sm" style={{ fontSize: 11, marginTop: 2 }}>
            {tentativa.tempoSegundos
              ? `Tempo: ${formatarTempo(tentativa.tempoSegundos)}`
              : ''}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Caixas Leitner
// ─────────────────────────────────────────────
const COR_CAIXA = ['#ff4b4b', '#ff9600', '#ffc800', '#1cb0f6', '#58cc02'];
const LABEL_CAIXA = ['Iniciando', 'Aprendendo', 'Praticando', 'Dominando', 'Dominado'];

function CaixasLeitner({ caixas }) {
  const max = Math.max(...caixas.map(c => c.total), 1);
  const totalCards = caixas.reduce((s, c) => s + c.total, 0);

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <RefreshCw size={15} color="var(--laranja)" />
        <h3 style={{ fontSize: 14 }}>Caixas de revisão</h3>
        <span className="muted-sm">({totalCards} cards)</span>
      </div>
      <div style={{ display: 'grid', gap: 9 }}>
        {caixas.map(c => (
          <div key={c.n}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: COR_CAIXA[c.n - 1] }}>
                Cx {c.n} — {LABEL_CAIXA[c.n - 1]}
              </span>
              <span style={{ fontSize: 12, fontWeight: 800 }}>{c.total}</span>
            </div>
            <div className="progresso-trilha" style={{ height: 8 }}>
              <div className="progresso-barra" style={{
                width: `${(c.total / max) * 100}%`,
                background: COR_CAIXA[c.n - 1],
              }} />
            </div>
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
// Progresso do plano
// ─────────────────────────────────────────────
function ProgressoPlano({ stats }) {
  const pct = stats.total > 0 ? Math.round((stats.concluidos / stats.total) * 100) : 0;
  const pendentes = stats.total - stats.concluidos - stats.andamento;

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <BookOpen size={15} color="var(--azul-info)" />
        <h3 style={{ fontSize: 14 }}>Progresso do plano</h3>
      </div>

      {/* Número grande no centro */}
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 46, fontWeight: 900, fontFamily: 'var(--fonte-titulo)', color: 'var(--tinta)', lineHeight: 1 }}>
          {pct}
        </span>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--lobo)' }}>%</span>
        <p className="muted-sm" style={{ marginTop: 3 }}>concluído</p>
      </div>

      <div className="progresso-trilha" style={{ height: 12, marginBottom: 14 }}>
        <div className="progresso-barra" style={{ width: `${pct}%` }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, textAlign: 'center' }}>
        <MiniStat val={stats.concluidos} label="Concluídos" cor="var(--verde)" />
        <MiniStat val={stats.andamento}  label="Andamento"  cor="var(--laranja)" />
        <MiniStat val={pendentes}        label="Pendentes"  cor="var(--lobo)" />
      </div>

      <Link to="/plano" className="muted-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 14, color: 'var(--verde)', fontWeight: 700, textDecoration: 'none' }}>
        Ver plano <ArrowRight size={13} />
      </Link>
    </div>
  );
}

function MiniStat({ val, label, cor }) {
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 900, color: cor }}>{val}</div>
      <div className="muted-sm" style={{ fontSize: 11 }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componentes auxiliares simples
// ─────────────────────────────────────────────
function CardMetrica({ icon: Icon, cor, valor, rotulo, to }) {
  return (
    <Link to={to} className="card pop" style={{ borderLeft: `4px solid ${cor}`, textDecoration: 'none' }}>
      <Icon size={22} color={cor} />
      <div style={{ fontSize: 36, fontWeight: 900, fontFamily: 'var(--fonte-titulo)', marginTop: 8, lineHeight: 1, color: 'var(--tinta)' }}>
        {valor}
      </div>
      <div className="muted-sm" style={{ marginTop: 5 }}>{rotulo}</div>
    </Link>
  );
}

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
// Helpers
// ─────────────────────────────────────────────
function calcularSequencia(tentativas) {
  if (!tentativas.length) return 0;
  const datas = [...new Set(
    tentativas.map(t => new Date(t.finalizadoEm).toISOString().split('T')[0])
  )].sort().reverse();

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const ultima = new Date(datas[0] + 'T00:00:00');
  if (Math.floor((hoje - ultima) / 86400000) > 1) return 0;

  let seq = 1;
  for (let i = 1; i < datas.length; i++) {
    const prev = new Date(datas[i] + 'T00:00:00');
    const curr = new Date(datas[i - 1] + 'T00:00:00');
    if (Math.floor((curr - prev) / 86400000) === 1) seq++;
    else break;
  }
  return seq;
}

function formatarTempo(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}min${sec > 0 ? ` ${sec}s` : ''}`;
}
