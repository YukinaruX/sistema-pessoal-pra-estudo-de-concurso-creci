import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Trophy, RotateCcw, Home } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../hooks/useAuth.js';

const DISCIPLINAS = ['Todas', 'Conhecimentos Específicos', 'Legislação e Ética'];

function embaralhar(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function criarCartas(pares) {
  const cartas = [];
  pares.forEach((p, i) => {
    cartas.push({ id: `t-${i}`, parId: i, conteudo: p.termo,     tipo: 'termo',  combinada: false });
    cartas.push({ id: `d-${i}`, parId: i, conteudo: p.definicao, tipo: 'def',    combinada: false });
  });
  return embaralhar(cartas);
}

export default function JogoMemoria() {
  const { user } = useAuth();
  const [fase, setFase]             = useState('aguardando');
  const [disciplina, setDisciplina] = useState('Todas');
  const [cartas, setCartas]         = useState([]);
  const [viradas, setViradas]       = useState([]);
  const [combinadas, setCombinadas] = useState(new Set());
  const [tentativas, setTentativas] = useState(0);
  const [tempo, setTempo]           = useState(0);
  const [recorde, setRecorde]       = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [bloqueado, setBloqueado]   = useState(false);
  const [semPares, setSemPares]     = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    supabase.from('jogo_recordes').select('pontuacao')
      .eq('user_id', user.id).eq('jogo', 'memoria')
      .order('pontuacao', { ascending: true }).limit(1)
      .then(({ data }) => { if (data?.[0]) setRecorde(data[0].pontuacao); });
  }, [user.id]);

  const iniciar = useCallback(async () => {
    setCarregando(true);
    setSemPares(false);
    let q = supabase.from('jogo_pares').select('*');
    if (disciplina !== 'Todas') q = q.eq('disciplina', disciplina);
    const { data } = await q;
    const pool  = embaralhar(data || []);
    const min   = 3; // mínimo de pares para jogar
    const max   = 8; // máximo de pares (16 cartas)
    const pares = pool.slice(0, max);
    if (pares.length < min) { setSemPares(true); setCarregando(false); return; }
    // Adapta o grid: 3-4 pares → cols=4, 5-6 → cols=4, 7-8 → cols=4 (sempre 4 cols)
    setCartas(criarCartas(pares));
    setViradas([]); setCombinadas(new Set()); setTentativas(0); setTempo(0); setBloqueado(false);
    setCarregando(false);
    setFase('jogando');
  }, [disciplina]);

  // Timer
  useEffect(() => {
    if (fase !== 'jogando') { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => setTempo(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [fase]);

  const ganhouRef = useRef(false);
  useEffect(() => {
    if (fase === 'jogando' && cartas.length > 0 && combinadas.size === cartas.length / 2 && !ganhouRef.current) {
      ganhouRef.current = true;
      clearInterval(timerRef.current);
      setTimeout(() => {
        salvar(tempo);
        setFase('ganhou');
      }, 600);
    }
  }, [combinadas, cartas, fase, tempo]);

  async function salvar(t) {
    await supabase.from('jogo_recordes').insert({
      user_id: user.id, jogo: 'memoria', pontuacao: t,
      disciplina: disciplina === 'Todas' ? null : disciplina,
    });
    if (recorde === null || t < recorde) setRecorde(t);
  }

  function clicarCarta(carta) {
    if (bloqueado || carta.combinada || viradas.includes(carta.id)) return;
    if (viradas.length === 2) return;

    const novas = [...viradas, carta.id];
    setViradas(novas);

    if (novas.length === 2) {
      setTentativas(t => t + 1);
      setBloqueado(true);
      const [id1, id2] = novas;
      const c1 = cartas.find(c => c.id === id1);
      const c2 = cartas.find(c => c.id === id2);

      if (c1.parId === c2.parId) {
        // Combinou!
        setCombinadas(prev => {
          const n = new Set(prev);
          n.add(c1.parId);
          return n;
        });
        setViradas([]);
        setBloqueado(false);
      } else {
        // Não combinou — vira de volta após delay
        setTimeout(() => { setViradas([]); setBloqueado(false); }, 900);
      }
    }
  }

  const fmtTempo = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ─── Aguardando ───
  if (fase === 'aguardando') return (
    <div className="grid" style={{ gap: 20, maxWidth: 520, margin: '0 auto' }}>
      <Link to="/jogos" className="muted-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'var(--lobo)' }}>← Jogos</Link>
      <div className="card surgir" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🧠</div>
        <h1 style={{ fontSize: 24 }}>Jogo da Memória</h1>
        <p className="muted-sm" style={{ marginTop: 6, marginBottom: 20, lineHeight: 1.6 }}>
          Encontre os pares de termos e definições.<br />Vença no menor tempo possível!
        </p>
        {recorde !== null && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 22, fontSize: 14, fontWeight: 700 }}>
            <Trophy size={16} color="var(--amarelo)" /> Melhor tempo: {fmtTempo(recorde)}
          </div>
        )}
        <div style={{ marginBottom: 20, textAlign: 'left' }}>
          <label className="campo">Disciplina</label>
          <select className="input" value={disciplina} onChange={e => setDisciplina(e.target.value)}>
            {DISCIPLINAS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        {semPares && (
          <div style={{
            marginBottom: 16, padding: '14px 16px',
            borderRadius: 'var(--raio-sm)',
            background: 'var(--cisne)',
            border: '2px solid var(--lobo)',
            fontSize: 13, lineHeight: 1.6, textAlign: 'left',
          }}>
            <strong>Nenhum par cadastrado{disciplina !== 'Todas' ? ` para "${disciplina}"` : ''}.</strong>
            <br />
            Adicione pares na tabela <code>jogo_pares</code> do Supabase para jogar.
            <br />
            <span className="muted-sm">Exemplo: <code>termo = "CRECI"</code> / <code>definicao = "Conselho Regional de Corretores de Imóveis"</code></span>
          </div>
        )}
        <button className="btn btn-primario" style={{ width: '100%', fontSize: 16 }}
          onClick={iniciar} disabled={carregando}>
          {carregando ? 'Carregando…' : <><Grid size={16} /> Iniciar jogo</>}
        </button>
      </div>
    </div>
  );

  // ─── Ganhou ───
  if (fase === 'ganhou') return (
    <div className="grid" style={{ gap: 20, maxWidth: 520, margin: '0 auto' }}>
      <div className="card surgir" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
        <h2 style={{ fontSize: 22 }}>Todos os pares encontrados!</h2>
        {(recorde === tempo) && <p style={{ color: 'var(--verde)', fontWeight: 800, marginTop: 4 }}>Novo recorde!</p>}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, margin: '28px 0' }}>
          <Stat label="Tempo" val={fmtTempo(tempo)} cor="var(--azul-info)" />
          <Stat label="Tentativas" val={tentativas} cor="var(--amarelo)" />
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primario" onClick={() => { ganhouRef.current = false; iniciar(); }}>
            <RotateCcw size={15} /> Jogar novamente
          </button>
          <Link to="/jogos" className="btn"><Home size={15} /> Jogos</Link>
        </div>
      </div>
    </div>
  );

  // ─── Jogando ───
  const pairsTotal = cartas.length / 2;
  return (
    <div className="grid" style={{ gap: 16, maxWidth: 640, margin: '0 auto' }}>
      {/* HUD */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--fonte-titulo)', fontVariantNumeric: 'tabular-nums' }}>
          ⏱ {fmtTempo(tempo)}
        </div>
        <div className="muted-sm" style={{ fontSize: 13, fontWeight: 700 }}>
          {combinadas.size}/{pairsTotal} pares
        </div>
        <div className="muted-sm" style={{ fontSize: 13 }}>{tentativas} tentativas</div>
      </div>

      {/* Barra de progresso */}
      <div className="progresso-trilha" style={{ height: 6 }}>
        <div style={{
          height: '100%', borderRadius: 'var(--raio-pill)', background: 'var(--verde)',
          width: `${(combinadas.size / pairsTotal) * 100}%`, transition: 'width 0.4s ease-out',
        }} />
      </div>

      {/* Grid de cartas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10,
      }}>
        {cartas.map(carta => {
          const virada    = viradas.includes(carta.id) || combinadas.has(carta.parId);
          const combinada = combinadas.has(carta.parId);
          return (
            <div key={carta.id}
              className="carta-jogo-container"
              style={{ height: 90 }}
              onClick={() => clicarCarta(carta)}
            >
              <div className={`carta-jogo-inner${virada ? ' virada' : ''}`}>
                {/* Verso (frente mostrada = costas da carta) */}
                <div className="carta-jogo-frente" style={{
                  background: 'var(--gradiente)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  🧠
                </div>
                {/* Frente (conteúdo da carta) */}
                <div className="carta-jogo-verso" style={{
                  background: combinada ? '#58cc0222' : 'var(--neve)',
                  border: `2px solid ${combinada ? 'var(--verde)' : carta.tipo === 'termo' ? 'var(--azul-info)' : 'var(--laranja)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 8,
                  fontSize: combinada ? 11 : 11,
                  fontWeight: 700,
                  textAlign: 'center',
                  lineHeight: 1.35,
                  color: combinada ? 'var(--verde)' : 'var(--tinta)',
                }}>
                  {carta.conteudo}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 4, gap: 16 }}>
        <span style={{ fontSize: 12, color: 'var(--azul-info)', fontWeight: 700 }}>■ Termos</span>
        <span style={{ fontSize: 12, color: 'var(--laranja)', fontWeight: 700 }}>■ Definições</span>
      </div>
    </div>
  );
}

function Stat({ label, val, cor }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 900, color: cor, fontFamily: 'var(--fonte-titulo)' }}>{val}</div>
      <div className="muted-sm" style={{ fontSize: 12 }}>{label}</div>
    </div>
  );
}
