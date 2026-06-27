import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flag, Filter, Play, RotateCcw, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { questaoFromRow } from '../lib/mappers.js';
import { useAuth } from '../hooks/useAuth.js';
import { useTentativaAtiva } from '../hooks/useTentativaAtiva.js';
import { useDificuldade } from '../hooks/useDificuldade.js';
import { resumoRespostas, formatarTempo } from '../lib/estatisticas.js';
import { inicializarCard } from '../lib/leitner.js';
import { NIVEIS, ROTULOS, CORES } from '../lib/dificuldade.js';
import { estoqueEsgotado } from '../lib/gerarQuestoes.js';
import QuestaoCard from '../components/simulado/QuestaoCard.jsx';
import Cronometro from '../components/simulado/Cronometro.jsx';
import Loading from '../components/shared/Loading.jsx';

function embaralhar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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
    descartarTentativa,
  } = useTentativaAtiva(user?.id);

  const [questoes, setQuestoes] = useState([]);
  const [carregandoQ, setCarregandoQ] = useState(true);
  const [erroQ, setErroQ] = useState(null);
  const [filtro, setFiltro] = useState('Todas');
  const [filtroDificuldade, setFiltroDificuldade] = useState('Todas');
  const [indice, setIndice] = useState(0);
  const [finalizando, setFinalizando] = useState(false);
  const [entrouNaProva, setEntrouNaProva] = useState(false);
  const [qtdQuestoes, setQtdQuestoes] = useState(0);
  const [gerando, setGerando] = useState(false);
  const [erroGeracao, setErroGeracao] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { dificuldades } = useDificuldade(user?.id);

  const totalDisponivel = useMemo(() => {
    let base = filtro === 'Todas' ? questoes : questoes.filter((q) => q.disciplina === filtro);
    if (filtroDificuldade !== 'Todas') {
      base = base.filter((q) => (dificuldades.get(q.id) ?? 'nova') === filtroDificuldade);
    }
    return base.length;
  }, [questoes, filtro, filtroDificuldade, dificuldades]);

  useEffect(() => {
    if (totalDisponivel > 0 && !entrouNaProva) {
      setQtdQuestoes((prev) => (prev <= 0 ? totalDisponivel : Math.min(prev, totalDisponivel)));
    }
  }, [totalDisponivel, entrouNaProva]);
  const esgotado = questoes.length > 0 && estoqueEsgotado(questoes, dificuldades);
  const cronometroRef = useRef(null);

  // Carrega as questões do simulado. refreshKey sobe a cada geração de questões.
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
  }, [refreshKey]);

  const disciplinas = useMemo(
    () => ['Todas', ...Array.from(new Set(questoes.map((q) => q.disciplina)))],
    [questoes]
  );

  const lista = useMemo(() => {
    if (entrouNaProva && tentativa?.questoesIds?.length > 0) {
      const porId = Object.fromEntries(questoes.map((q) => [q.id, q]));
      const ordenadas = tentativa.questoesIds.map((id) => porId[id]).filter(Boolean);
      return filtro === 'Todas' ? ordenadas : ordenadas.filter((q) => q.disciplina === filtro);
    }
    return filtro === 'Todas' ? questoes : questoes.filter((q) => q.disciplina === filtro);
  }, [questoes, filtro, tentativa, entrouNaProva]);

  const respondidas = Object.values(respostas).filter((r) => r.resposta).length;

  if (carregando || carregandoQ) return <Loading texto="Preparando o simulado…" />;
  if (erro || erroQ)
    return <ErroBox texto={erro || erroQ} />;
  if (questoes.length === 0)
    return (
      <ErroBox texto="Nenhuma questão encontrada. Rode o seed do banco (supabase/seed.sql)." />
    );

  async function gerarMaisQuestoes() {
    setGerando(true);
    setErroGeracao(null);
    try {
      const simuladoId = questoes[0]?.simuladoId;
      const { error } = await supabase.functions.invoke('gerar-questoes', {
        body: { simulado_id: simuladoId, quantidade: 10 },
      });
      if (error) throw new Error(error.message);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setErroGeracao(err.message);
    } finally {
      setGerando(false);
    }
  }

  async function começarNovo() {
    if (tentativa) await descartarTentativa();
    let base = filtro === 'Todas' ? questoes : questoes.filter((q) => q.disciplina === filtro);
    if (filtroDificuldade !== 'Todas') {
      base = base.filter((q) => (dificuldades.get(q.id) ?? 'nova') === filtroDificuldade);
    }
    const selecionadas = embaralhar(base).slice(0, qtdQuestoes);
    await iniciarTentativa(selecionadas.map((q) => q.id));
    setIndice(0);
    setEntrouNaProva(true);
  }

  // Antes de entrar na prova: tela inicial (o cronômetro só começa aqui).
  if (!entrouNaProva) {
    // Há um simulado em andamento dos acessos anteriores → continuar ou recomeçar.
    if (tentativa) {
      return (
        <div className="grid" style={{ gap: 18 }}>
          <h1 className="slide-esq" style={{ fontSize: 28 }}>Simulado</h1>
          <div className="card surgir" style={{ display: 'grid', gap: 18, padding: 26 }}>
            <div>
              <h2 style={{ fontSize: 20 }}>Você tem um simulado em andamento</h2>
              <p className="muted-sm" style={{ marginTop: 6, lineHeight: 1.6 }}>
                {respondidas} de {tentativa.questoesIds?.length ?? questoes.length} questões respondidas · tempo acumulado{' '}
                {formatarTempo(tentativa.tempoSegundos || 0)}. Continue de onde parou ou comece
                um novo (o anterior será descartado).
              </p>
            </div>
            {erro && <ErroBox texto={erro} />}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                className="btn btn-primario"
                onClick={() => setEntrouNaProva(true)}
                disabled={iniciando}
              >
                <Play size={17} /> Continuar simulado
              </button>
              <button className="btn btn-secundario" onClick={começarNovo} disabled={iniciando}>
                <RotateCcw size={16} /> {iniciando ? 'Aguarde…' : 'Começar novo'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Nenhuma tentativa: escolher filtro e começar.
    return (
      <div className="grid" style={{ gap: 18 }}>
        <h1 className="slide-esq" style={{ fontSize: 28 }}>Simulado</h1>
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
              {totalDisponivel} questões neste filtro · {questoes.length} no total
            </div>
          </div>

          <div>
            <label className="campo">
              <Filter size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> Filtrar por dificuldade
            </label>
            <select
              className="input"
              value={filtroDificuldade}
              onChange={(e) => { setFiltroDificuldade(e.target.value); setIndice(0); }}
              style={{ maxWidth: 220 }}
            >
              <option value="Todas">Todas</option>
              {NIVEIS.map((n) => (
                <option key={n} value={n}>{ROTULOS[n]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="campo">Número de questões</label>
            <input
              type="number"
              className="input"
              min={1}
              max={totalDisponivel}
              value={qtdQuestoes || ''}
              onChange={(e) => {
                const v = Math.max(1, Math.min(totalDisponivel, Number(e.target.value) || 1));
                setQtdQuestoes(v);
              }}
              style={{ maxWidth: 120 }}
            />
            <div className="muted-sm" style={{ marginTop: 4 }}>
              questões por simulado (máx. {totalDisponivel})
            </div>
          </div>

          {esgotado && (
            <div
              className="card"
              style={{ borderColor: 'var(--alerta)', background: 'rgba(234,179,8,0.07)', padding: 18 }}
            >
              <strong style={{ fontSize: 15 }}>Estoque de questões novas esgotado</strong>
              <p className="muted-sm" style={{ marginTop: 6, marginBottom: 14, lineHeight: 1.6 }}>
                Você já respondeu todas as {questoes.length} questões disponíveis ao menos uma vez.
                Gere novas questões com IA para continuar praticando.
              </p>
              {erroGeracao && (
                <p style={{ color: 'var(--erro)', fontSize: 14, marginBottom: 10 }}>{erroGeracao}</p>
              )}
              <button
                className="btn btn-secundario"
                onClick={gerarMaisQuestoes}
                disabled={gerando}
              >
                <Sparkles size={16} /> {gerando ? 'Gerando questões com IA…' : 'Gerar 10 questões com IA'}
              </button>
            </div>
          )}

          {erro && <ErroBox texto={erro} />}

          <button
            className="btn btn-primario"
            onClick={começarNovo}
            disabled={iniciando}
            style={{ justifySelf: 'start' }}
          >
            <Play size={17} /> {iniciando ? 'Iniciando…' : 'Começar simulado'}
          </button>
        </div>
      </div>
    );
  }

  // entrou na prova mas a tentativa ainda não chegou (criação em andamento)
  if (!tentativa) return <Loading texto="Iniciando simulado…" />;

  const questaoAtual = lista[indice];

  async function responder(valor) {
    const correta = valor ? valor === questaoAtual.gabarito : null;
    await salvarResposta(questaoAtual.id, valor, correta);
  }

  async function finalizar() {
    if (!confirm('Finalizar o simulado? Você não poderá mais alterar as respostas.')) return;
    setFinalizando(true);
    // Trava a persistência do cronômetro (para o salvamento automático não
    // sobrescrever o tempo final) e lê o tempo decorrido dele.
    cronometroRef.current?.travar();
    const tempoFinal = cronometroRef.current?.getTempo() ?? (tentativa.tempoSegundos || 0);
    try {
      // Estatísticas sobre as questões desta tentativa (respeitando a seleção e ordem).
      const questoesSimulado = tentativa.questoesIds?.length > 0
        ? tentativa.questoesIds.map((id) => questoes.find((q) => q.id === id)).filter(Boolean)
        : questoes;
      const todas = questoesSimulado.map((q) => respostas[q.id] || { resposta: null, correta: null });
      const resumo = resumoRespostas(todas, questoesSimulado.length);

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
      const erradas = questoesSimulado.filter((q) => respostas[q.id]?.correta === false);
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
      // Destrava o cronômetro para o usuário poder tentar de novo.
      cronometroRef.current?.travar(false);
      setFinalizando(false);
    }
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="slide-esq" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 26 }}>Simulado</h1>
        <Cronometro
          ref={cronometroRef}
          tentativaId={tentativa.id}
          tempoInicial={tentativa.tempoSegundos || 0}
        />
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
          dificuldade={dificuldades.get(questaoAtual.id) ?? 'nova'}
        />
      )}

      <div className="acoes-simulado" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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

      <GradeNavegacao lista={lista} respostas={respostas} indice={indice} onIr={setIndice} />
    </div>
  );
}

// Botão de navegação memoizado: só re-renderiza quando o SEU estado muda
// (virou o atual, ou passou a ter resposta). Ao responder uma questão, apenas
// um botão muda — os demais são pulados pelo React.memo.
const BotaoNav = memo(function BotaoNav({ numero, indice, ativo, respondido, onIr }) {
  return (
    <button
      onClick={() => onIr(indice)}
      title={`Questão ${numero}`}
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        fontWeight: 700,
        fontSize: 13,
        cursor: 'pointer',
        color: 'var(--texto)',
        border: ativo ? '2px solid var(--azul-claro)' : '1px solid var(--borda)',
        background: respondido ? 'rgba(37,99,235,0.25)' : 'var(--superficie)',
      }}
    >
      {numero}
    </button>
  );
});

// Grade de navegação memoizada. `onIr` deve ser estável (passamos o setIndice,
// que o React garante constante) para o memo dos botões funcionar.
const GradeNavegacao = memo(function GradeNavegacao({ lista, respostas, indice, onIr }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="muted-sm" style={{ marginBottom: 10 }}>Ir para a questão</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {lista.map((q, i) => (
          <BotaoNav
            key={q.id}
            numero={i + 1}
            indice={i}
            ativo={i === indice}
            respondido={Boolean(respostas[q.id]?.resposta)}
            onIr={onIr}
          />
        ))}
      </div>
    </div>
  );
});

function ErroBox({ texto }) {
  return (
    <div className="card" style={{ borderColor: 'var(--erro)' }}>
      <strong style={{ color: 'var(--erro)' }}>Ops…</strong>
      <p style={{ marginTop: 6 }}>{texto}</p>
    </div>
  );
}
