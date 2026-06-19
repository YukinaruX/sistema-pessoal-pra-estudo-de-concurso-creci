import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PartyPopper, Layers } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { cardFromRow, questaoFromRow } from '../lib/mappers.js';
import { promoverCard, rebaixarCard, paraDataISO } from '../lib/leitner.js';
import { useAuth } from '../hooks/useAuth.js';
import FlashcardRevisao from '../components/revisao/FlashcardRevisao.jsx';
import Loading from '../components/shared/Loading.jsx';

export default function Revisao() {
  const { user } = useAuth();
  const [fila, setFila] = useState([]); // { card, questao }
  const [pos, setPos] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [revisadosHoje, setRevisadosHoje] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setCarregando(true);
        const hoje = paraDataISO(new Date());
        const { data, error } = await supabase
          .from('revisao_cards')
          .select('*, questoes(*)')
          .eq('user_id', user.id)
          .lte('proxima_revisao', hoje)
          .order('caixa', { ascending: true })
          .order('proxima_revisao', { ascending: true });
        if (error) throw error;

        const itens = (data || [])
          .filter((r) => r.questoes)
          .map((r) => ({ card: cardFromRow(r), questao: questaoFromRow(r.questoes) }));
        setFila(itens);
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    })();
  }, [user.id]);

  async function classificar(acertou) {
    const atual = fila[pos];
    if (!atual) return;
    const atualizado = acertou ? promoverCard(atual.card) : rebaixarCard(atual.card);

    const { error } = await supabase
      .from('revisao_cards')
      .update({
        caixa: atualizado.caixa,
        proxima_revisao: atualizado.proximaRevisao,
        vezes_revisada: atualizado.vezesRevisada,
        vezes_errada: atualizado.vezesErrada,
        ultima_revisao_em: atualizado.ultimaRevisaoEm,
      })
      .eq('id', atual.card.id);
    if (error) {
      setErro(error.message);
      return;
    }
    setRevisadosHoje((n) => n + 1);
    setPos((p) => p + 1);
  }

  if (carregando) return <Loading texto="Buscando cards vencidos…" />;
  if (erro) return <div className="card" style={{ borderColor: 'var(--erro)' }}>{erro}</div>;

  const atual = fila[pos];
  const terminou = !atual;

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 28 }}>Revisão de erros</h1>
        <span className="badge" style={{ background: 'var(--superficie-2)', gap: 6, marginLeft: 'auto' }}>
          <Layers size={15} /> {Math.min(pos, fila.length)} / {fila.length}
        </span>
      </div>

      {terminou ? (
        <div className="card" style={{ textAlign: 'center', padding: 44 }}>
          <PartyPopper size={44} color="var(--sucesso)" style={{ marginBottom: 12 }} />
          {fila.length === 0 ? (
            <>
              <h2 style={{ fontSize: 20 }}>Nada para revisar hoje 🎉</h2>
              <p className="muted-sm" style={{ marginTop: 8 }}>
                Cards de revisão aparecem aqui quando você erra questões num simulado e quando a data de
                repetição espaçada vence.
              </p>
              <Link to="/simulado" className="btn btn-primario" style={{ marginTop: 18 }}>
                Fazer um simulado
              </Link>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 20 }}>Revisão concluída!</h2>
              <p className="muted-sm" style={{ marginTop: 8 }}>
                Você revisou {revisadosHoje} {revisadosHoje === 1 ? 'card' : 'cards'} hoje. Volte amanhã para os
                próximos.
              </p>
              <Link to="/" className="btn btn-primario" style={{ marginTop: 18 }}>
                Ir ao dashboard
              </Link>
            </>
          )}
        </div>
      ) : (
        <FlashcardRevisao
          key={atual.card.id}
          questao={atual.questao}
          caixa={atual.card.caixa}
          onClassificar={classificar}
        />
      )}
    </div>
  );
}
