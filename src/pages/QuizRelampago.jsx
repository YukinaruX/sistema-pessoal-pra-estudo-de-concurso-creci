import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Trophy, RotateCcw, Home } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../hooks/useAuth.js';

const DURACAO = 60;
const DISCIPLINAS = ['Todas', 'Conhecimentos Específicos', 'Legislação e Ética', 'Matemática', 'Português', 'Noções de Informática'];
const RAIO = 40, CIRC = 2 * Math.PI * RAIO;

function embaralhar(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pontosPorTempo(segundosRestantes) {
  return 10 + Math.floor(segundosRestantes / 10) * 2;
}

export default function QuizRelampago() {
  const { user } = useAuth();
  const [fase, setFase]               = useState('aguardando'); // aguardando | jogando | fim
  const [disciplina, setDisciplina]   = useState('Todas');
  const [questoes, setQuestoes]       = useState([]);
  const [idx, setIdx]                 = useState(0);
  const [tempo, setTempo]             = useState(DURACAO);
  const [pontos, setPontos]           = useState(0);
  const [acertos, setAcertos]         = useState(0);
  const [total, setTotal]             = useState(0);
  const [feedback, setFeedback]       = useState(null); // 'certo' | 'errado' | null
  const [recorde, setRecorde]         = useState(null);
  const [carregando, setCarregando]   = useState(false);
  const timerRef = useRef(null);

  // Carrega recorde
  useEffect(() => {
    supabase.from('jogo_recordes').select('pontuacao')
      .eq('user_id', user.id).eq('jogo', 'quiz_relampago')
      .order('pontuacao', { ascending: false }).limit(1)
      .then(({ data }) => { if (data?.[0]) setRecorde(data[0].pontuacao); });
  }, [user.id]);

  const iniciar = useCallback(async () => {
    setCarregando(true);
    let query = supabase.from('jogo_questoes').select('*');
    if (disciplina !== 'Todas') query = query.eq('disciplina', disciplina);
    const { data } = await query;
    const pool = embaralhar(data || []);
    if (pool.length < 3) { alert('Sem questões suficientes para esta disciplina.'); setCarregando(false); return; }
    setQuestoes(pool);
    setIdx(0); setTempo(DURACAO); setPontos(0); setAcertos(0); setTotal(0); setFeedback(null);
    setCarregando(false);
    setFase('jogando');
  }, [disciplina]);

  // Timer countdown
  useEffect(() => {
    if (fase !== 'jogando') return;
    timerRef.current = setInterval(() => {
      setTempo(t => {
        if (t <= 1) { clearInterval(timerRef.current); encerrar(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [fase]);

  function encerrar() {
    clearInterval(timerRef.current);
    setFase('fim');
  }

  async function salvarRecorde(pts) {
    if (pts > 0) {
      await supabase.from('jogo_recordes').insert({
        user_id: user.id, jogo: 'quiz_relampago', pontuacao: pts,
        disciplina: disciplina === 'Todas' ? null : disciplina,
      });
      if (recorde === null || pts > recorde) setRecorde(pts);
    }
  }

  useEffect(() => {
    if (fase === 'fim') salvarRecorde(pontos);
  }, [fase]);

  function responder(opcao) {
    if (feedback) return;
    const q     = questoes[idx % questoes.length];
    const certa = q.resposta;
    const ok    = (q.tipo === 'vf')
      ? (opcao === certa)
      : (opcao === certa);

    setTotal(t => t + 1);
    if (ok) {
      setPontos(p => p + pontosPorTempo(tempo));
      setAcertos(a => a + 1);
      setFeedback('certo');
    } else {
      setFeedback('errado');
    }
    setTimeout(() => {
      setFeedback(null);
      setIdx(i => i + 1);
    }, 500);
  }

  const questaoAtual = questoes.length > 0 ? questoes[idx % questoes.length] : null;
  const opcoes = questaoAtual?.tipo === 'vf'
    ? [{ label: '✅ Verdadeiro', val: 'true' }, { label: '❌ Falso', val: 'false' }]
    : (questaoAtual?.opcoes || []).map(o => ({ label: o, val: o }));

  const timeFrac = tempo / DURACAO;
  const corTimer = tempo > 20 ? 'var(--verde)' : tempo > 10 ? 'var(--laranja)' : '#ff4b4b';

  // ─── Aguardando ───
  if (fase === 'aguardando') return (
    <div className="grid" style={{ gap: 20, maxWidth: 520, margin: '0 auto' }}>
      <Link to="/jogos" className="muted-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'var(--lobo)' }}>
        ← Jogos
      </Link>
      <div className="card surgir" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>⚡</div>
        <h1 style={{ fontSize: 24 }}>Quiz Relâmpago</h1>
        <p className="muted-sm" style={{ marginTop: 6, marginBottom: 24, lineHeight: 1.6 }}>
          60 segundos, o máximo de questões.<br />
          Responda rápido — respostas mais ágeis valem mais pontos!
        </p>
        {recorde !== null && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 22, fontSize: 14, fontWeight: 700 }}>
            <Trophy size={16} color="var(--amarelo)" /> Seu recorde: {recorde} pts
          </div>
        )}
        <div style={{ marginBottom: 20, textAlign: 'left' }}>
          <label className="campo">Disciplina</label>
          <select className="input" value={disciplina} onChange={e => setDisciplina(e.target.value)}>
            {DISCIPLINAS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <button className="btn btn-primario" style={{ width: '100%', fontSize: 16 }}
          onClick={iniciar} disabled={carregando}>
          {carregando ? 'Carregando…' : <><Zap size={16} /> Iniciar quiz</>}
        </button>
      </div>
    </div>
  );

  // ─── Fim ───
  if (fase === 'fim') return (
    <div className="grid" style={{ gap: 20, maxWidth: 520, margin: '0 auto' }}>
      <div className="card surgir" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>
          {pontos > (recorde ?? 0) ? '🎉' : acertos > total / 2 ? '⚡' : '📚'}
        </div>
        <h2 style={{ fontSize: 22 }}>Tempo esgotado!</h2>
        {pontos >= (recorde ?? 0) && pontos > 0 && (
          <p style={{ color: 'var(--verde)', fontWeight: 800, marginTop: 4 }}>Novo recorde!</p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, margin: '28px 0' }}>
          <Stat label="Pontuação" val={pontos} cor="var(--amarelo)" />
          <Stat label="Acertos" val={acertos} cor="var(--verde)" />
          <Stat label="Questões" val={total} cor="var(--azul-info)" />
        </div>
        {total > 0 && (
          <p className="muted-sm" style={{ marginBottom: 24 }}>
            Aproveitamento: {Math.round((acertos / total) * 100)}%
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primario" onClick={iniciar}>
            <RotateCcw size={15} /> Jogar novamente
          </button>
          <Link to="/jogos" className="btn">
            <Home size={15} /> Jogos
          </Link>
        </div>
      </div>
    </div>
  );

  // ─── Jogando ───
  return (
    <div className="grid" style={{ gap: 16, maxWidth: 560, margin: '0 auto' }}>
      {/* HUD */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        {/* Timer circular */}
        <svg width={96} height={96} viewBox="0 0 96 96">
          <circle cx={48} cy={48} r={RAIO} fill="none" stroke="var(--cisne)" strokeWidth={7} />
          <circle cx={48} cy={48} r={RAIO} fill="none" stroke={corTimer} strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - timeFrac)}
            transform="rotate(-90 48 48)"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
          />
          <text x={48} y={52} textAnchor="middle" fontSize={22} fontWeight={900}
            fill={corTimer} fontFamily="var(--fonte-titulo)">{tempo}</text>
        </svg>

        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--amarelo)', fontFamily: 'var(--fonte-titulo)', fontVariantNumeric: 'tabular-nums' }}>
            {pontos} pts
          </div>
          <div className="muted-sm" style={{ fontSize: 13 }}>{acertos}/{total} acertos</div>
        </div>
      </div>

      {/* Cartão de questão */}
      {questaoAtual && (
        <div className={`card surgir${feedback ? ` feedback-${feedback}` : ''}`}
          key={idx}
          style={{
            borderColor: feedback === 'certo' ? 'var(--verde)' : feedback === 'errado' ? '#ff4b4b' : undefined,
            background: feedback === 'certo' ? '#58cc0218' : feedback === 'errado' ? '#ff4b4b18' : undefined,
            transition: 'background 0.3s, border-color 0.3s',
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--lobo)', marginBottom: 10 }}>
            {questaoAtual.disciplina}
          </p>
          <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.55, marginBottom: 20 }}>
            {questaoAtual.pergunta}
          </p>
          <div style={{ display: 'grid', gap: 8 }}>
            {opcoes.map(op => (
              <button
                key={op.val}
                onClick={() => responder(op.val)}
                disabled={!!feedback}
                style={{
                  padding: '12px 16px', borderRadius: 'var(--raio-sm)',
                  border: '2px solid var(--cisne)',
                  background: 'var(--neve)', color: 'var(--tinta)',
                  fontFamily: 'var(--fonte)', fontWeight: 700, fontSize: 14,
                  cursor: feedback ? 'default' : 'pointer', textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseOver={e => { if (!feedback) { e.currentTarget.style.borderColor = 'var(--verde)'; e.currentTarget.style.background = 'var(--cisne)'; } }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--cisne)'; e.currentTarget.style.background = 'var(--neve)'; }}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, val, cor }) {
  return (
    <div>
      <div style={{ fontSize: 32, fontWeight: 900, color: cor, fontFamily: 'var(--fonte-titulo)', fontVariantNumeric: 'tabular-nums' }}>{val}</div>
      <div className="muted-sm" style={{ fontSize: 12 }}>{label}</div>
    </div>
  );
}
