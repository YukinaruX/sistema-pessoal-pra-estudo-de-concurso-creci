import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { tentativaFromRow, respostaFromRow } from '../lib/mappers.js';

const SIMULADO_PADRAO = '11111111-1111-1111-1111-111111111111';

// Gerencia a tentativa "em_andamento" do usuário. Ao montar, apenas RECUPERA
// uma tentativa já em andamento (para continuar de onde parou) — não cria nada
// automaticamente. A criação só acontece quando o usuário chama
// `iniciarTentativa()` (é o que dá início ao cronômetro). Expõe também o
// autosave de respostas via `salvarResposta`.
export function useTentativaAtiva(userId) {
  const [tentativa, setTentativa] = useState(null);
  const [respostas, setRespostas] = useState({}); // { [questaoId]: respostaRow }
  const [carregando, setCarregando] = useState(true);
  const [iniciando, setIniciando] = useState(false);
  const [erro, setErro] = useState(null);
  const carregadoRef = useRef(false);

  // Recupera a tentativa em andamento existente (se houver) — sem criar.
  useEffect(() => {
    if (!userId || carregadoRef.current) return;
    carregadoRef.current = true;

    (async () => {
      try {
        setCarregando(true);

        const { data: existentes, error: e1 } = await supabase
          .from('tentativas')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'em_andamento')
          .order('iniciado_em', { ascending: false })
          .limit(1);
        if (e1) throw e1;

        const row = existentes?.[0];
        if (row) {
          setTentativa(tentativaFromRow(row));

          const { data: resps, error: e3 } = await supabase
            .from('respostas')
            .select('*')
            .eq('tentativa_id', row.id);
          if (e3) throw e3;

          const mapa = {};
          for (const r of resps || []) mapa[r.questao_id] = respostaFromRow(r);
          setRespostas(mapa);
        }
      } catch (err) {
        setErro(err.message || 'Falha ao carregar a tentativa.');
      } finally {
        setCarregando(false);
      }
    })();
  }, [userId]);

  // Descarta a tentativa em andamento atual (apaga do banco; as respostas caem
  // junto por cascata). Usado pelo "Começar novo".
  const descartarTentativa = useCallback(async () => {
    if (tentativa?.id) {
      await supabase.from('tentativas').delete().eq('id', tentativa.id);
    }
    setRespostas({});
    setTentativa(null);
  }, [tentativa]);

  // Cria uma nova tentativa — este é o gatilho que inicia o cronômetro.
  // questaoIds: array de IDs na ordem embaralhada escolhida pelo usuário.
  const iniciarTentativa = useCallback(async (questaoIds) => {
    if (!userId) return;
    setIniciando(true);
    setErro(null);
    try {
      const { data, error } = await supabase
        .from('tentativas')
        .insert({ user_id: userId, simulado_id: SIMULADO_PADRAO, questoes_ids: questaoIds ?? null })
        .select('*')
        .single();
      if (error) throw error;
      setRespostas({});
      setTentativa(tentativaFromRow(data));
    } catch (err) {
      setErro(err.message || 'Falha ao iniciar o simulado.');
    } finally {
      setIniciando(false);
    }
  }, [userId]);

  // Autosave de uma resposta (upsert por tentativa+questao).
  const salvarResposta = useCallback(
    async (questaoId, resposta, correta) => {
      if (!tentativa) return;
      // Atualização otimista da UI.
      setRespostas((prev) => ({
        ...prev,
        [questaoId]: { questaoId, resposta, correta, tentativaId: tentativa.id },
      }));

      const { error } = await supabase
        .from('respostas')
        .upsert(
          {
            tentativa_id: tentativa.id,
            questao_id: questaoId,
            resposta,
            correta,
          },
          { onConflict: 'tentativa_id,questao_id' }
        );
      if (error) setErro(error.message);
    },
    [tentativa]
  );

  return {
    tentativa,
    setTentativa,
    respostas,
    carregando,
    iniciando,
    erro,
    salvarResposta,
    iniciarTentativa,
    descartarTentativa,
  };
}
