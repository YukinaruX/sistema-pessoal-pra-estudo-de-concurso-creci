// Retorna true quando todas as questões já foram respondidas pelo menos uma vez.
// Questão ausente do mapa de dificuldades = 'nova' (nunca respondida).
export function estoqueEsgotado(questoes, dificuldades) {
  if (questoes.length === 0) return false;
  return questoes.every((q) => dificuldades.has(q.id));
}

// Valida o formato de uma questão gerada pelo Claude antes de inserir no banco.
export function validarQuestaoGerada(q) {
  if (!q || typeof q !== 'object') return false;
  if (!['C', 'E'].includes(q.gabarito)) return false;
  return ['disciplina', 'assunto', 'enunciado', 'explicacao'].every(
    (campo) => typeof q[campo] === 'string' && q[campo].trim().length > 0
  );
}
