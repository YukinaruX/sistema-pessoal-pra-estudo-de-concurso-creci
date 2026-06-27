import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Trophy, RotateCcw, Home, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../hooks/useAuth.js';

const MAX_VIDAS = 3;

function embaralhar(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function Sobrevivencia() {
  const { user } = useAuth();
  const [fase, setFase]             = useState('aguardando');
  const [disciplina, setDisciplina] = useState('Todas');
  const [questoes, setQuestoes]     = useState([]);
  const [idx, setIdx]               = useState(0);
  const [vidas, setVidas]           = useState(MAX_VIDAS);
  const [pontos, setPontos]         = useState(0);
  const [feedback, setFeedback]     = useState(null); // { ok: bool, correto: str }
  const [recorde, setRecorde]       = useState(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    supabase.from('jogo_recordes').select('pontuacao')
      .eq('user_id', user.id).eq('jogo', 'sobrevivencia')
      .order('pontuacao', { ascending: false }).limit(1)
      .then(({ data }) => { if (data?.[0]) setRecorde(data[0].pontuacao); });
  }, [user.id]);

  const DISCIPLINAS = ['Todas', 'Conhecimentos Específicos', 'Legislação e Ética', 'Matemática', 'Português', 'Noções de Informática'];

  const iniciar = useCallback(async () => {
    setCarregando(true);
    let q = supabase.from('jogo_questoes').select('*');
    if (disciplina !== 'Todas') q = q.eq('disciplina', disciplina);
    const { data } = await q;
    const pool = embaralhar(data || []);
    if (pool.length < 3) { alert('Sem questões para esta disciplina.'); setCarregando(false); return; }
    setQuestoes(pool);
    setIdx(0); setVidas(MAX_VIDAS); setPontos(0); setFeedback(null);
    setCarregando(false);
    setFase('jogando');
  }, [disciplina]);

  async function salvar(pts) {
    if (pts > 0) {
      await supabase.from('jogo_recordes').insert({
        user_id: user.id, jogo: 'sobrevivencia', pontuacao: pts,
        disciplina: disciplina === 'Todas' ? null : disciplina,
      });
      if (recorde === null || pts > recorde) setRecorde(pts);
    }
  }

  function responder(opcao) {
    if (feedback) return;
    const q    = questoes[idx % questoes.length];
    const ok   = opcao === q.resposta;
    const novasVidas = ok ? vidas : vidas - 1;

    setFeedback({ ok, correto: q.resposta });
    if (ok) setPontos(p => p + 10);
    setVidas(novasVidas);

    if (novasVidas <= 0) {
      setTimeout(() => { salvar(pontos + (ok ? 10 : 0)); setFase('fim'); }, 1200);
    } else {
      setTimeout(() => { setFeedback(null); setIdx(i => i + 1); }, 1000);
    }
  }

  const q       = questoes.length > 0 ? questoes[idx % questoes.length] : null;
  const opcoes  = q?.tipo === 'vf'
    ? [{ label: '✅ Verdadeiro', val: 'true' }, { label: '❌ Falso', val: 'false' }]
    : (q?.opcoes || []).map(o => ({ label: o, val: o }));

  // ─── Aguardando ───
  if (fase === 'aguardando') return (
    <div className="grid" style={{ gap: 20, maxWidth: 520, margin: '0 auto' }}>
      <Link to="/jogos" className="muted-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'var(--lobo)' }}>
        ← Jogos
      </Link>
      <div className="card surgir" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>❤️</div>
        <h1 style={{ fontSize: 24 }}>Modo Sobrevivência</h1>
        <p className="muted-sm" style={{ marginTop: 6, marginBottom: 20, lineHeight: 1.6 }}>
          Você tem <strong style={{ color: '#ff4b4b' }}>3 vidas</strong>. Erre 3 vezes e o jogo acaba.<br />
          Quanto mais longe chegar, maior sua pontuação!
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
          {carregando ? 'Carregando…' : <><Shield size={16} /> Começar</>}
        </button>
      </div>
    </div>
  );

  // ─── Fim ───
  if (fase === 'fim') return (
    <div className="grid" style={{ gap: 20, maxWidth: 520, margin: '0 auto' }}>
      <div className="card surgir" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>💔</div>
        <h2 style={{ fontSize: 22 }}>Sem mais vidas!</h2>
        {pontos >= (recorde ?? 0) && pontos > 0 && (
          <p style={{ color: 'var(--verde)', fontWeight: 800, marginTop: 4 }}>🎉 Novo recorde!</p>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '28px 0' }}>
          <Stat label="Pontuação" val={pontos} cor="var(--amarelo)" />
          <Stat label="Questões" val={Math.floor(pontos / 10)} cor="var(--verde)" />
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primario" onClick={iniciar}>
            <RotateCcw size={15} /> Jogar novamente
          </button>
          <Link to="/jogos" className="btn"><Home size={15} /> Jogos</Link>
        </div>
      </div>
    </div>
  );

  // ─── Jogando ───
  return (
    <div className="grid" style={{ gap: 16, maxWidth: 560, margin: '0 auto' }}>
      {/* HUD */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[...Array(MAX_VIDAS)].map((_, i) => (
            <span key={i} style={{
              fontSize: 30, lineHeight: 1,
              filter: i >= vidas ? 'grayscale(1) opacity(0.3)' : 'none',
              transition: 'filter 0.4s',
              transform: feedback && !feedback.ok && i === vidas ? 'scale(1.4)' : 'scale(1)',
              transitionProperty: 'filter, transform',
            }}>❤️</span>
          ))}
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--amarelo)', fontFamily: 'var(--fonte-titulo)', fontVariantNumeric: 'tabular-nums' }}>
          {pontos} pts
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
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 14, fontWeight: 800,
              color: feedback.ok ? 'var(--verde)' : '#ff4b4b',
            }}>
              {feedback.ok ? <CheckCircle size={20} /> : <XCircle size={20} />}
              {feedback.ok ? 'Correto!' : `Errado! Resposta: ${feedback.correto === 'true' ? 'Verdadeiro' : feedback.correto === 'false' ? 'Falso' : feedback.correto}`}
            </div>
          )}
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--lobo)', marginBottom: 10 }}>
            {q.disciplina}
          </p>
          <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.55, marginBottom: 20 }}>
            {q.pergunta}
          </p>
          <div style={{ display: 'grid', gap: 8 }}>
            {opcoes.map(op => {
              const correta  = feedback && op.val === q.resposta;
              const errada   = feedback && !feedback.ok && op.val === feedback.val;
              return (
                <button key={op.val} onClick={() => responder(op.val)} disabled={!!feedback}
                  style={{
                    padding: '12px 16px', borderRadius: 'var(--raio-sm)', textAlign: 'left',
                    border: `2px solid ${correta ? 'var(--verde)' : errada ? '#ff4b4b' : 'var(--cisne)'}`,
                    background: correta ? '#58cc0222' : errada ? '#ff4b4b22' : 'var(--neve)',
                    color: 'var(--tinta)', fontFamily: 'var(--fonte)', fontWeight: 700, fontSize: 14,
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
