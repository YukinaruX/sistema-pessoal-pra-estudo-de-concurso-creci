import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flag, Filter, Clock, Play } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { questaoFromRow } from '../lib/mappers.js';
import { useAuth } from '../hooks/useAuth.js';
import { useTentativaAtiva } from '../hooks/useTentativaAtiva.js';
import { resumoRespostas, formatarTempo } from '../lib/estatisticas.js';
import { inicializarCard } from '../lib/leitner.js';
import QuestaoCard from '../components/simulado/QuestaoCard.jsx';
import Loading from '../components/shared/Loading.jsx';

export default function Simulado() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    tentativa,
    respostas,
    carregando,
    iniciando,
    erro,
    salvarResposta,
    setTentativa,
    iniciarTentativa,
  } = useTentativaAtiva(user?.id);

  const [questoes, setQuestoes] = useState([]);
  const [carregandoQ, setCarregandoQ] = useState(true);
  const [erroQ, setErroQ] = useState(null);
  const [filtro, setFiltro] = useState('Todas');
  const [indice, setIndice] = useState(0);
  const [finalizando, setFinalizando] = useState(false);

  // Cronômetro que PAUSA quando a aba fica oculta ou você sai da página. O tempo
  // ativo é acumulado em `tempo_segundos` e persistido a cada pausa, então ao
  // voltar ele continua de onde parou (sem contar o tempo em que ficou fora).
  const [segundos, setSegundos] = useState(0);
  const baseRef = useRef(0); // segundos já acumulados antes desta sessão ativa
  const sessaoInicioRef = useRef(null); // ms do início da sessão ativa (null = pausado)
  const tentativaIdRef = useRef(null);
  const finalizadoRef = useRef(false);

  const persistirTempo = useCallback(async (total) => {
    const id = tentativaIdRef.current;
    if (id == null || finalizadoRef.current) return;
    await supabase.from('tentativas').update({ tempo_segundos: total }).eq('id', id);
  }, []);

  useEffect(() => {
    if (!tentativa?.id) return undefined;
    tentativaIdRef.current = tentativa.id;
    baseRef.current = tentativa.tempoSegundos || 0;
    sessaoInicioRef.current = Date.now();

    const calc = () =>
      baseRef.current +
      (sessaoInicioRef.current ? Math.floor((Date.now() - sessaoInicioRef.current) / 1000) : 0);

    const pintarInicial = setTimeout(() => setSegundos(calc()), 0);
    const tick = setInterval(() => setSegundos(calc()), 1000);

    const pausar = () => {
      if (sessaoInicioRef.current == null) return;
      baseRef.current = calc();
      sessaoInicioRef.current = null;
      setSegundos(baseRef.current);
      persistirTempo(baseRef.current);
    };
    const retomar = () => {
      if (sessaoInicioRef.current == null) sessaoInicioRef.current = Date.now();
    };
    const aoMudarVisibilidade = () => (document.hidden ? pausar() : retomar());

    document.addEventListener('visibilitychange', aoMudarVisibilidade);
    window.addEventListener('pagehide', pausar);

    return () => {
      clearTimeout(pintarInicial);
      clearInterval(tick);
      document.removeEventListener('visibilitychange', aoMudarVisibilidade);
      window.removeEventListener('pagehide', pausar);
      pausar(); // ao sair da página (navegar/desmontar), acumula e salva o tempo
    };
  }, [tentativa?.id, tentativa?.tempoSegundos, persistirTempo]);

  // Carrega as questões do simulado.
  useEffect(() => {
    (async () => {
      try {
        setCarregandoQ(true);
        const { data, error } = await supabase
          .from('questoes')
          .select('*')
          .order('ordem', { ascending: true });
        if (error) throw error;
        setQuestoes((data || []).map(questaoFromRow));
      } catch (err) {
        setErroQ(err.message);
      } finally {
        setCarregandoQ(false);
      }
    })();
  }, []);

  const disciplinas = useMemo(
    () => ['Todas', ...Array.from(new Set(questoes.map((q) => q.disciplina)))],
    [questoes]
  );

  const lista = useMemo(
    () => (filtro === 'Todas' ? questoes : questoes.filter((q) => q.disciplina === filtro)),
    [questoes, filtro]
  );

  const respondidas = Object.values(respostas).filter((r) => r.resposta).length;

  if (carregando || carregandoQ) return <Loading texto="Preparando o simulado…" />;
  if (erro || erroQ)
    return <ErroBox texto={erro || erroQ} />;
  if (questoes.length === 0)
    return (
      <ErroBox texto="Nenhuma questão encontrada. Rode o seed do banco (supabase/seed.sql)." />
    );

  // Sem tentativa em andamento: tela inicial. O cronômetro só começa ao clicar
  // em "Começar simulado" (gatilho que cria a tentativa).
  if (!tentativa) {
    return (
      <div className="grid" style={{ gap: 18 }}>
        <h1 style={{ fontSize: 28 }}>Simulado</h1>
        <div className="card surgir" style={{ display: 'grid', gap: 18, padding: 26 }}>
          <div>
            <h2 style={{ fontSize: 20 }}>Pronto para começar?</h2>
            <p className="muted-sm" style={{ marginTop: 6, lineHeight: 1.6 }}>
              O cronômetro começa <strong>somente</strong> quando você clicar em "Começar
              simulado". Seu progresso é salvo automaticamente — dá para fechar e continuar
              depois de onde parou.
            </p>
          </div>

          <div>
            <label className="campo">
              <Filter size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> Filtrar por disciplina
            </label>
            <select
              className="input"
              value={filtro}
              onChange={(e) => {
                setFiltro(e.target.value);
                setIndice(0);
              }}
              style={{ maxWidth: 320 }}
            >
              {disciplinas.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <div className="muted-sm" style={{ marginTop: 8 }}>
              {lista.length} questões neste filtro · {questoes.length} no total
            </div>
          </div>

          {erro && <ErroBox texto={erro} />}

          <button
            className="btn btn-primario"
            onClick={iniciarTentativa}
            disabled={iniciando}
            style={{ justifySelf: 'start' }}
          >
            <Play size={17} /> {iniciando ? 'Iniciando…' : 'Começar simulado'}
          </button>
        </div>
      </div>
    );
  }

  const questaoAtual = lista[indice];

  async function responder(valor) {
    const correta = valor ? valor === questaoAtual.gabarito : null;
    await salvarResposta(questaoAtual.id, valor, correta);
  }

  async function finalizar() {
    if (!confirm('Finalizar o simulado? Você não poderá mais alterar as respostas.')) return;
    setFinalizando(true);
    // Trava a persistência automática do cronômetro para o cleanup não
    // sobrescrever o tempo final com um valor defasado.
    finalizadoRef.current = true;
    const tempoFinal =
      baseRef.current +
      (sessaoInicioRef.current ? Math.floor((Date.now() - sessaoInicioRef.current) / 1000) : 0);
    try {
      // Estatísticas sobre TODAS as questões do simulado (não só o filtro).
      const todas = questoes.map((q) => respostas[q.id] || { resposta: null, correta: null });
      const resumo = resumoRespostas(todas, questoes.length);

      const { data, error } = await supabase
        .from('tentativas')
        .update({
          finalizado_em: new Date().toISOString(),
          tempo_segundos: tempoFinal,
          total_certas: resumo.certas,
          total_erradas: resumo.erradas,
          total_brancos: resumo.brancos,
          percentual: resumo.percentual,
          status: 'finalizado',
        })
        .eq('id', tentativa.id)
        .select('*')
        .single();
      if (error) throw error;

      // Cada questão errada entra (ou reseta) na revisão Leitner — caixa 1.
      const erradas = questoes.filter((q) => respostas[q.id]?.correta === false);
      if (erradas.length > 0) {
        const cards = erradas.map((q) => {
          const c = inicializarCard(q.id);
          return {
            user_id: user.id,
            questao_id: q.id,
            caixa: c.caixa,
            proxima_revisao: c.proximaRevisao,
          };
        });
        const { error: errCards } = await supabase
          .from('revisao_cards')
          .upsert(cards, { onConflict: 'user_id,questao_id' });
        if (errCards) console.error('Falha ao criar cards de revisão:', errCards.message);
      }

      setTentativa(data);
      navigate(`/resultado/${tentativa.id}`);
    } catch (err) {
      alert('Erro ao finalizar: ' + err.message);
      // Destrava e retoma o cronômetro para o usuário poder tentar de novo.
      finalizadoRef.current = false;
      if (sessaoInicioRef.current == null) sessaoInicioRef.current = Date.now();
      setFinalizando(false);
    }
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 26 }}>Simulado</h1>
        <div
          className="badge"
          style={{ background: 'var(--superficie-2)', gap: 6, fontSize: 14, padding: '7px 14px' }}
        >
          <Clock size={15} /> {formatarTempo(segundos)}
        </div>
        <div className="muted-sm" style={{ marginLeft: 'auto' }}>
          {respondidas} de {questoes.length} respondidas
        </div>
      </div>

      <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Filter size={16} className="texto-fraco" />
        <select
          className="input"
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setIndice(0); // reinicia no começo ao trocar de filtro
          }}
          style={{ maxWidth: 260 }}
        >
          {disciplinas.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <span className="muted-sm">{lista.length} questões neste filtro</span>
      </div>

      {questaoAtual && (
        <QuestaoCard
          key={questaoAtual.id}
          questao={questaoAtual}
          numero={indice + 1}
          total={lista.length}
          resposta={respostas[questaoAtual.id]?.resposta || null}
          onResponder={responder}
        />
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          className="btn btn-secundario"
          disabled={indice === 0}
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
        >
          <ChevronLeft size={18} /> Anterior
        </button>
        <button
          className="btn btn-secundario"
          disabled={indice >= lista.length - 1}
          onClick={() => setIndice((i) => Math.min(lista.length - 1, i + 1))}
        >
          Próxima <ChevronRight size={18} />
        </button>
        <button
          className="btn btn-primario"
          style={{ marginLeft: 'auto' }}
          onClick={finalizar}
          disabled={finalizando}
        >
          <Flag size={17} /> {finalizando ? 'Finalizando…' : 'Finalizar simulado'}
        </button>
      </div>

      {/* Navegação rápida por número */}
      <div className="card" style={{ padding: 14 }}>
        <div className="muted-sm" style={{ marginBottom: 10 }}>Ir para a questão</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {lista.map((q, i) => {
            const r = respostas[q.id]?.resposta;
            return (
              <button
                key={q.id}
                onClick={() => setIndice(i)}
                title={`Questão ${i + 1}`}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  color: 'var(--texto)',
                  border: i === indice ? '2px solid var(--azul-claro)' : '1px solid var(--borda)',
                  background: r ? 'rgba(37,99,235,0.25)' : 'var(--superficie)',
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ErroBox({ texto }) {
  return (
    <div className="card" style={{ borderColor: 'var(--erro)' }}>
      <strong style={{ color: 'var(--erro)' }}>Ops…</strong>
      <p style={{ marginTop: 6 }}>{texto}</p>
    </div>
  );
}
