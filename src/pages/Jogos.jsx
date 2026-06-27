import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, Grid, MapPin, ArrowRight, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../hooks/useAuth.js';

const JOGOS = [
  {
    id: 'quiz_relampago',
    to: '/jogos/quiz-relampago',
    emoji: '⚡',
    icon: Zap,
    nome: 'Quiz Relâmpago',
    desc: '60 segundos para responder o máximo de questões.',
    cor: 'var(--amarelo)',
    pontoLabel: 'pts',
  },
  {
    id: 'sobrevivencia',
    to: '/jogos/sobrevivencia',
    emoji: '❤️',
    icon: Shield,
    nome: 'Modo Sobrevivência',
    desc: '3 vidas. Responda até perder tudo. Bata seu recorde!',
    cor: '#ff4b4b',
    pontoLabel: 'pts',
  },
  {
    id: 'memoria',
    to: '/jogos/memoria',
    emoji: '🧠',
    icon: Grid,
    nome: 'Jogo da Memória',
    desc: 'Associe termos a definições virando pares de cartas.',
    cor: 'var(--azul-info)',
    pontoLabel: 's',
    menorMelhor: true,
  },
  {
    id: 'trilha',
    to: '/jogos/trilha',
    emoji: '🏆',
    icon: MapPin,
    nome: 'Trilha do Saber',
    desc: 'Avance na trilha respondendo questões até o final.',
    cor: 'var(--verde)',
    pontoLabel: 'pts',
  },
];

export default function Jogos() {
  const { user } = useAuth();
  const [recordes, setRecordes] = useState({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('jogo_recordes')
        .select('jogo, pontuacao')
        .eq('user_id', user.id);
      if (!data) return;
      const mapa = {};
      data.forEach(r => {
        if (!mapa[r.jogo] || r.pontuacao > mapa[r.jogo]) mapa[r.jogo] = r.pontuacao;
      });
      setRecordes(mapa);
    })();
  }, [user.id]);

  return (
    <div className="grid" style={{ gap: 24 }}>
      <div className="slide-esq">
        <h1 style={{ fontSize: 28 }}>Jogos de Estudo</h1>
        <p className="muted-sm" style={{ marginTop: 4 }}>
          Aprenda de forma dinâmica enquanto se prepara para o CRECI-BA.
        </p>
      </div>

      <div className="grid surgir-lista" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {JOGOS.map((j, i) => (
          <Link
            key={j.id}
            to={j.to}
            className="card"
            style={{
              textDecoration: 'none',
              display: 'flex', flexDirection: 'column', gap: 14,
              borderLeft: `4px solid ${j.cor}`,
              animationDelay: `${i * 0.07}s`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontSize: 36, lineHeight: 1 }}>{j.emoji}</div>
              {recordes[j.id] !== undefined && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'var(--cisne)', borderRadius: 'var(--raio-pill)',
                  padding: '3px 10px', fontSize: 12, fontWeight: 700,
                }}>
                  <Trophy size={12} color="var(--amarelo)" />
                  {j.menorMelhor
                    ? `${recordes[j.id]}s`
                    : `${recordes[j.id]} pts`}
                </div>
              )}
            </div>
            <div>
              <h2 style={{ fontSize: 17, marginBottom: 4 }}>{j.nome}</h2>
              <p className="muted-sm" style={{ fontSize: 13, lineHeight: 1.5 }}>{j.desc}</p>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: j.cor, fontWeight: 800, fontSize: 13, marginTop: 'auto',
            }}>
              Jogar agora <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>

      <div className="card surgir" style={{ background: 'var(--cisne)', border: 'none', animationDelay: '0.3s' }}>
        <p className="muted-sm" style={{ fontSize: 13 }}>
          💡 <strong>Dica:</strong> As questões dos jogos são diferentes das do simulado — focadas em
          termos, conceitos e raciocínio rápido. Use os jogos para revisar depois de cada sessão de estudo.
        </p>
      </div>
    </div>
  );
}
