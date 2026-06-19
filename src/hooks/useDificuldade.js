import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { construirMapaDificuldade } from '../lib/dificuldade.js';

// Retorna Map(questaoId → nivel) com a dificuldade personalizada de cada questão
// calculada a partir do histórico de respostas do usuário. RLS garante que só
// vêm as respostas do próprio usuário autenticado.
export function useDificuldade(userId) {
  const [dificuldades, setDificuldades] = useState(new Map());
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCarregando(false);
      return;
    }
    (async () => {
      try {
        setCarregando(true);
        const { data, error } = await supabase
          .from('respostas')
          .select('questao_id, correta')
          .not('resposta', 'is', null);
        if (error) throw error;
        setDificuldades(construirMapaDificuldade(data ?? []));
      } catch (err) {
        console.error('[useDificuldade]', err.message);
        setDificuldades(new Map());
      } finally {
        setCarregando(false);
      }
    })();
  }, [userId]);

  return { dificuldades, carregando };
}
