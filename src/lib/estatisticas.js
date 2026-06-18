// Cálculo centralizado de estatísticas de tentativa (certas/erradas/percentual).
// Não duplicar esta lógica nas páginas — sempre importar daqui.

// Recebe um array de { resposta: 'C'|'E'|null, correta: bool|null } e o total
// de questões do simulado. Retorna o resumo numérico.
export function resumoRespostas(respostas, totalQuestoes) {
  const respondidas = respostas.filter((r) => r.resposta === 'C' || r.resposta === 'E');
  const certas = respondidas.filter((r) => r.correta === true).length;
  const erradas = respondidas.filter((r) => r.correta === false).length;
  const brancos = Math.max(totalQuestoes - respondidas.length, 0);
  const percentual = totalQuestoes > 0 ? (certas / totalQuestoes) * 100 : 0;
  return {
    certas,
    erradas,
    brancos,
    respondidas: respondidas.length,
    total: totalQuestoes,
    percentual: Math.round(percentual * 10) / 10,
  };
}

// Desempenho agrupado por disciplina, para gráficos do histórico/resultado.
// Recebe respostas com { disciplina, correta }.
export function desempenhoPorDisciplina(respostas) {
  const mapa = new Map();
  for (const r of respostas) {
    if (!r.disciplina) continue;
    const atual = mapa.get(r.disciplina) || { certas: 0, total: 0 };
    atual.total += 1;
    if (r.correta === true) atual.certas += 1;
    mapa.set(r.disciplina, atual);
  }
  return Array.from(mapa.entries()).map(([disciplina, v]) => ({
    disciplina,
    certas: v.certas,
    total: v.total,
    percentual: v.total > 0 ? Math.round((v.certas / v.total) * 1000) / 10 : 0,
  }));
}

// Formata segundos como HH:MM:SS (ou MM:SS se < 1h).
export function formatarTempo(segundos) {
  const s = Math.max(0, Math.floor(segundos || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(seg)}` : `${pad(m)}:${pad(seg)}`;
}

// Dias entre hoje e a data da prova (negativo = prova já passou).
export function diasAteProva(dataProva, hoje = new Date()) {
  if (!dataProva) return null;
  const alvo = new Date(`${dataProva}T00:00:00`);
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const ms = alvo - base;
  return Math.round(ms / 86400000);
}
