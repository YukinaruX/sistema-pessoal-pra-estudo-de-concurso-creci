import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, MinusCircle, Target, Clock, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { tentativaFromRow, questaoFromRow } from '../lib/mappers.js';
import { desempenhoPorDisciplina, formatarTempo } from '../lib/estatisticas.js';
import { corDisciplina } from '../styles/theme.js';
import QuestaoCard from '../components/simulado/QuestaoCard.jsx';
import Loading from '../components/shared/Loading.jsx';

export default function ResultadoTentativa() {
  const { id } = useParams();
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
      <Link to="/historico" className="muted-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={15} /> Voltar ao histórico
      </Link>

      <h1 style={{ fontSize: 28 }}>Resultado do simulado</h1>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
        <Metrica icon={Target} cor="var(--azul-claro)" valor={`${tentativa.percentual ?? 0}%`} rotulo="Aproveitamento" />
        <Metrica icon={CheckCircle2} cor="var(--sucesso)" valor={tentativa.totalCertas ?? 0} rotulo="Certas" />
        <Metrica icon={XCircle} cor="var(--erro)" valor={tentativa.totalErradas ?? 0} rotulo="Erradas" />
        <Metrica icon={MinusCircle} cor="var(--texto-fraco)" valor={tentativa.totalBrancos ?? 0} rotulo="Em branco" />
        <Metrica icon={Clock} cor="var(--alerta)" valor={formatarTempo(tentativa.tempoSegundos)} rotulo="Tempo" />
      </div>

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
