export const NIVEIS = ['nova', 'facil', 'media', 'dificil'];

export const ROTULOS = {
  nova: 'Nova',
  facil: 'Fácil',
  media: 'Média',
  dificil: 'Difícil',
};

export const CORES = {
  nova: 'var(--texto-fraco)',
  facil: 'var(--sucesso)',
  media: 'var(--alerta)',
  dificil: 'var(--erro)',
};

// Retorna o nível de dificuldade com base na taxa de erro histórica do usuário.
// nova   → nunca respondida
// facil  → 0% de erro
// media  → 1–49% de erro
// dificil → 50%+ de erro
export function calcularNivel(totalRespostas, totalErradas) {
  if (totalRespostas === 0) return 'nova';
  const taxa = totalErradas / totalRespostas;
  if (taxa === 0) return 'facil';
  if (taxa < 0.5) return 'media';
  return 'dificil';
}

// Recebe array de { questao_id, correta } (rows crus do Supabase)
// e devolve Map(questaoId → nivel). Questões ausentes = 'nova' (caller trata com ?? 'nova').
export function construirMapaDificuldade(respostas) {
  const contagens = new Map();
  for (const r of respostas) {
    const id = r.questao_id;
    const atual = contagens.get(id) ?? { total: 0, erradas: 0 };
    atual.total += 1;
    if (r.correta === false) atual.erradas += 1;
    contagens.set(id, atual);
  }
  const mapa = new Map();
  for (const [id, { total, erradas }] of contagens) {
    mapa.set(id, calcularNivel(total, erradas));
  }
  return mapa;
}
