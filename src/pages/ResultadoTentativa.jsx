import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, MinusCircle, Target, Clock, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { tentativaFromRow, questaoFromRow } from '../lib/mappers.js';
import { desempenhoPorDisciplina, formatarTempo } from '../lib/estatisticas.js';
import { corDisciplina } from '../styles/theme.js';
import { NIVEIS, ROTULOS, CORES } from '../lib/dificuldade.js';
import { useDificuldade } from '../hooks/useDificuldade.js';
import { useAuth } from '../hooks/useAuth.js';
import QuestaoCard from '../components/simulado/QuestaoCard.jsx';
import Loading from '../components/shared/Loading.jsx';

export default function ResultadoTentativa() {
  const { id } = useParams();
  const { user } = useAuth();
  const { dificuldades } = useDificuldade(user?.id);
  const [tentativa, setTentativa] = useState(null);
  const [itens, setItens] = useState([]); // { questao, resposta }
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setCarregando(true);
        const { data: tRow, error: e1 } = await supabase
          .from('tentativas')
          .select('*')
          .eq('id', id)
          .single();
        if (e1) throw e1;

        const { data: respRows, error: e2 } = await supabase
          .from('respostas')
          .select('resposta, correta, questao_id, questoes(*)')
          .eq('tentativa_id', id);
        if (e2) throw e2;

        const mapeados = (respRows || [])
          .filter((r) => r.questoes)
          .map((r) => ({
            questao: questaoFromRow(r.questoes),
            resposta: r.resposta,
          }))
          .sort((a, b) => (a.questao.ordem || 0) - (b.questao.ordem || 0));

        setTentativa(tentativaFromRow(tRow));
        setItens(mapeados);
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    })();
  }, [id]);

  if (carregando) return <Loading texto="Carregando resultado…" />;
  if (erro) return <div className="card" style={{ borderColor: 'var(--erro)' }}>{erro}</div>;
  if (!tentativa) return <div className="card">Tentativa não encontrada.</div>;

  const porDisc = desempenhoPorDisciplina(
    itens.map((it) => ({ disciplina: it.questao.disciplina, correta: it.resposta === it.questao.gabarito }))
  );

  return (
    <div className="grid" style={{ gap: 18 }}>
      <Link to="/historico" className="muted-sm slide-esq" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
        <ArrowLeft size={15} /> Voltar ao histórico
      </Link>

      <h1 className="slide-esq" style={{ fontSize: 28, animationDelay: '0.05s' }}>Resultado do simulado</h1>

      <div className="grid surgir-lista" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
        <Metrica icon={Target} cor="var(--azul-info)" valor={`${tentativa.percentual ?? 0}%`} rotulo="Aproveitamento" />
        <Metrica icon={CheckCircle2} cor="var(--verde)" valor={tentativa.totalCertas ?? 0} rotulo="Certas" />
        <Metrica icon={XCircle} cor="var(--vermelho)" valor={tentativa.totalErradas ?? 0} rotulo="Erradas" />
        <Metrica icon={MinusCircle} cor="var(--lobo)" valor={tentativa.totalBrancos ?? 0} rotulo="Em branco" />
        <Metrica icon={Clock} cor="var(--laranja)" valor={formatarTempo(tentativa.tempoSegundos)} rotulo="Tempo" />
      </div>

      {(() => {
        const porDific = NIVEIS
          .map((nivel) => {
            const questoesNivel = itens.filter(
              (it) => (dificuldades.get(it.questao.id) ?? 'nova') === nivel
            );
            const certas = questoesNivel.filter((it) => it.resposta === it.questao.gabarito).length;
            return { nivel, total: questoesNivel.length, certas };
          })
          .filter((d) => d.total > 0);

        if (porDific.length === 0) return null;
        return (
          <div className="card">
            <h3 style={{ marginBottom: 14, fontSize: 17 }}>Desempenho por dificuldade</h3>
            <div className="grid" style={{ gap: 12 }}>
              {porDific.map((d) => {
                const pct = d.total > 0 ? Math.round((d.certas / d.total) * 100) : 0;
                return (
                  <div key={d.nivel}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 14 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          className="badge"
                          style={{ background: CORES[d.nivel], fontSize: 11 }}
                        >
                          {ROTULOS[d.nivel]}
                        </span>
                      </span>
                      <span className="muted-sm">{d.certas}/{d.total} · {pct}%</span>
                    </div>
                    <div style={{ height: 9, borderRadius: 999, background: 'var(--superficie)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: CORES[d.nivel],
                          transition: 'width .5s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {porDisc.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: 17 }}>Desempenho por disciplina</h3>
          <div className="grid" style={{ gap: 12 }}>
            {porDisc.map((d) => (
              <div key={d.disciplina}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 14 }}>
                  <span>{d.disciplina}</span>
                  <span className="muted-sm">
                    {d.certas}/{d.total} · {d.percentual}%
                  </span>
                </div>
                <div style={{ height: 9, borderRadius: 999, background: 'var(--superficie)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${d.percentual}%`,
                      height: '100%',
                      background: corDisciplina(d.disciplina),
                      transition: 'width .5s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 style={{ fontSize: 20, marginTop: 6 }}>Revisão das questões</h2>
      <div className="grid" style={{ gap: 16 }}>
        {itens.map((it, i) => (
          <QuestaoCard
            key={it.questao.id}
            questao={it.questao}
            numero={i + 1}
            total={itens.length}
            resposta={it.resposta}
            onResponder={() => {}}
            revelar
            dificuldade={dificuldades.get(it.questao.id) ?? 'nova'}
          />
        ))}
      </div>
    </div>
  );
}

function Metrica({ icon: Icon, cor, valor, rotulo }) {
  return (
    <div className="card" style={{ borderLeft: `4px solid ${cor}`, padding: 16 }}>
      <Icon size={22} color={cor} />
      <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--fonte-titulo)', marginTop: 8 }}>{valor}</div>
      <div className="muted-sm">{rotulo}</div>
    </div>
  );
}
