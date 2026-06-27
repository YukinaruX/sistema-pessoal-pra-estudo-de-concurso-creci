import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Trophy, RotateCcw, Home, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../hooks/useAuth.js';

const MAX_POS        = 15;
const DISCIPLINAS    = ['Todas', 'Conhecimentos Específicos', 'Legislação e Ética', 'Matemática', 'Português', 'Noções de Informática'];
const COR_DISCIPLINA = {
  'Conhecimentos Específicos': '#1cb0f6',
  'Legislação e Ética':        '#ff9600',
  'Matemática':                '#58cc02',
  'Português':                 '#ce82ff',
  'Noções de Informática':     '#ff4b4b',
  'Todas':                     'var(--verde)',
};

function embaralhar(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// Células da trilha em formato snake (zigzag)
function buildTrilha() {
  const trilha = [];
  for (let i = 0; i <= MAX_POS; i++) {
    const row  = Math.floor(i / 5);
    const col  = row % 2 === 0 ? i % 5 : 4 - (i % 5);
    trilha.push({ pos: i, row, col });
  }
  return trilha;
}
const TRILHA = buildTrilha();

export default function TrilhaSaber() {
  const { user } = useAuth();
  const [fase, setFase]             = useState('aguardando');
  const [disciplina, setDisciplina] = useState('Todas');
  const [questoes, setQuestoes]     = useState([]);
  const [posicao, setPosicao]       = useState(0);
  const [idx, setIdx]               = useState(0);
  const [pontos, setPontos]         = useState(0);
  const [feedback, setFeedback]     = useState(null);
  const [recorde, setRecorde]       = useState(null);
  const [carregando, setCarregando] = useState(false);

  const iniciar = useCallback(async () => {
    setCarregando(true);
    let q = supabase.from('jogo_questoes').select('*');
    if (disciplina !== 'Todas') q = q.eq('disciplina', disciplina);
    const { data } = await q;
    const pool = embaralhar(data || []);
    if (pool.length < 3) { alert('Sem questões para esta disciplina.'); setCarregando(false); return; }
    setQuestoes(pool); setPosicao(0); setIdx(0); setPontos(0); setFeedback(null);
    setCarregando(false);
    setFase('jogando');
  }, [disciplina]);

  async function salvar(pts) {
    if (pts > 0) {
      await supabase.from('jogo_recordes').insert({
        user_id: user.id, jogo: 'trilha', pontuacao: pts,
        disciplina: disciplina === 'Todas' ? null : disciplina,
      });
      if (recorde === null || pts > recorde) setRecorde(pts);
    }
  }

  function responder(opcao) {
    if (feedback) return;
    const q  = questoes[idx % questoes.length];
    const ok = opcao === q.resposta;
    setFeedback({ ok, correto: q.resposta });

    if (ok) {
      const novaPos = posicao + 1;
      setPosicao(novaPos);
      setPontos(p => p + 10 + Math.floor(novaPos / 5) * 5);
      if (novaPos >= MAX_POS) {
        setTimeout(() => { salvar(pontos + 10 + Math.floor(novaPos / 5) * 5); setFase('ganhou'); }, 1200);
        return;
      }
    }
    setTimeout(() => { setFeedback(null); setIdx(i => i + 1); }, 1000);
  }

  const q      = questoes.length > 0 ? questoes[idx % questoes.length] : null;
  const opcoes = q?.tipo === 'vf'
    ? [{ label: '✅ Verdadeiro', val: 'true' }, { label: '❌ Falso', val: 'false' }]
    : (q?.opcoes || []).map(o => ({ label: o, val: o }));

  const corTema = COR_DISCIPLINA[disciplina] || 'var(--verde)';

  // ─── Aguardando ───
  if (fase === 'aguardando') return (
    <div className="grid" style={{ gap: 20, maxWidth: 520, margin: '0 auto' }}>
      <Link to="/jogos" className="muted-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'var(--lobo)' }}>
        ← Jogos
      </Link>
      <div className="card surgir" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🏆</div>
        <h1 style={{ fontSize: 24 }}>Trilha do Saber</h1>
        <p className="muted-sm" style={{ marginTop: 6, marginBottom: 20, lineHeight: 1.6 }}>
          Avance na trilha respondendo {MAX_POS} questões.<br />
          Chegue ao final para vencer!
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
          {carregando ? 'Carregando…' : <><MapPin size={16} /> Começar trilha</>}
        </button>
      </div>
    </div>
  );

  // ─── Ganhou ───
  if (fase === 'ganhou') return (
    <div className="grid" style={{ gap: 20, maxWidth: 520, margin: '0 auto' }}>
      <div className="card surgir" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🏆</div>
        <h2 style={{ fontSize: 22 }}>Trilha concluída!</h2>
        <p style={{ color: 'var(--verde)', fontWeight: 800, marginTop: 4 }}>Parabéns, você chegou ao final!</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, margin: '28px 0' }}>
          <Stat label="Pontuação" val={pontos} cor="var(--amarelo)" />
          <Stat label="Casas" val={MAX_POS} cor={corTema} />
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primario" onClick={iniciar}><RotateCcw size={15} /> Jogar novamente</button>
          <Link to="/jogos" className="btn"><Home size={15} /> Jogos</Link>
        </div>
      </div>
    </div>
  );

  // ─── Jogando ───
  return (
    <div className="grid" style={{ gap: 16, maxWidth: 580, margin: '0 auto' }}>
      {/* HUD */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--lobo)' }}>
          Casa {posicao} de {MAX_POS}
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--amarelo)', fontFamily: 'var(--fonte-titulo)', fontVariantNumeric: 'tabular-nums' }}>
          {pontos} pts
        </div>
      </div>

      {/* Trilha visual */}
      <div className="card" style={{ padding: '14px 10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
          {TRILHA.map(cell => {
            const isCurrent = cell.pos === posicao;
            const isVisited = cell.pos < posicao;
            const isFinal   = cell.pos === MAX_POS;
            return (
              <div key={cell.pos} style={{
                gridColumn: cell.col + 1,
                gridRow:    cell.row + 1,
                width: '100%', aspectRatio: '1',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isFinal ? 18 : 12,
                fontWeight: 900,
                background: isCurrent ? corTema : isVisited ? `${corTema}40` : 'var(--cisne)',
                color: isCurrent ? '#fff' : isVisited ? corTema : 'var(--lobo)',
                border: isCurrent ? `3px solid ${corTema}` : '2px solid transparent',
                boxShadow: isCurrent ? `0 0 12px ${corTema}88` : 'none',
                transition: 'all 0.4s cubic-bezier(0.34,1.4,0.64,1)',
              }}>
                {isFinal ? '🏆' : isCurrent ? '🎯' : isVisited ? '✓' : cell.pos}
              </div>
            );
          })}
        </div>
        <div className="progresso-trilha" style={{ height: 5, marginTop: 10 }}>
          <div style={{
            height: '100%', borderRadius: 'var(--raio-pill)', background: corTema,
            width: `${(posicao / MAX_POS) * 100}%`, transition: 'width 0.5s ease-out',
          }} />
        </div>
      </div>

      {/* Questão */}
      {q && (
        <div className="card surgir" key={idx} style={{
          borderColor: feedback ? (feedback.ok ? 'var(--verde)' : '#ff4b4b') : undefined,
          background:  feedback ? (feedback.ok ? '#58cc0218' : '#ff4b4b18') : undefined,
          transition: 'background 0.3s, border-color 0.3s',
        }}>
          {feedback && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontWeight: 800,
              color: feedback.ok ? 'var(--verde)' : '#ff4b4b',
            }}>
              {feedback.ok ? <CheckCircle size={20} /> : <XCircle size={20} />}
              {feedback.ok
                ? `+${10 + Math.floor((posicao) / 5) * 5} pts! Avançando...`
                : `Resposta: ${feedback.correto === 'true' ? 'Verdadeiro' : feedback.correto === 'false' ? 'Falso' : feedback.correto}`
              }
            </div>
          )}
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--lobo)', marginBottom: 10 }}>{q.disciplina}</p>
          <p style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.55, marginBottom: 18 }}>{q.pergunta}</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {opcoes.map(op => {
              const correta = feedback && op.val === q.resposta;
              const errada  = feedback && !feedback.ok && op.val !== q.resposta && op.val === feedback.escolha;
              return (
                <button key={op.val} onClick={() => responder(op.val)} disabled={!!feedback}
                  style={{
                    padding: '11px 14px', borderRadius: 'var(--raio-sm)', textAlign: 'left',
                    border: `2px solid ${correta ? 'var(--verde)' : errada ? '#ff4b4b' : 'var(--cisne)'}`,
                    background: correta ? '#58cc0222' : 'var(--neve)',
                    color: 'var(--tinta)', fontFamily: 'var(--fonte)', fontWeight: 700, fontSize: 13,
                    cursor: feedback ? 'default' : 'pointer',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}>
                  {op.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, val, cor }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 32, fontWeight: 900, color: cor, fontFamily: 'var(--fonte-titulo)', fontVariantNumeric: 'tabular-nums' }}>{val}</div>
      <div className="muted-sm" style={{ fontSize: 12 }}>{label}</div>
    </div>
  );
}
