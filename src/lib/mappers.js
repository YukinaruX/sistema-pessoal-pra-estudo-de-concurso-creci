// Mapeamento snake_case (banco) <-> camelCase (React).
// Centralizado aqui para não espalhar snake_case pela UI.

export function questaoFromRow(row) {
  return {
    id: row.id,
    simuladoId: row.simulado_id,
    disciplina: row.disciplina,
    assunto: row.assunto,
    enunciado: row.enunciado,
    gabarito: row.gabarito,
    explicacao: row.explicacao,
    ordem: row.ordem,
  };
}

export function tentativaFromRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    simuladoId: row.simulado_id,
    iniciadoEm: row.iniciado_em,
    finalizadoEm: row.finalizado_em,
    tempoSegundos: row.tempo_segundos,
    totalCertas: row.total_certas,
    totalErradas: row.total_erradas,
    totalBrancos: row.total_brancos,
    percentual: row.percentual,
    status: row.status,
    questoesIds: row.questoes_ids ?? null,
  };
}

export function respostaFromRow(row) {
  return {
    id: row.id,
    tentativaId: row.tentativa_id,
    questaoId: row.questao_id,
    resposta: row.resposta,
    correta: row.correta,
    respondidoEm: row.respondido_em,
  };
}

export function planoItemFromRow(row) {
  return {
    id: row.id,
    planoId: row.plano_id,
    disciplina: row.disciplina,
    assunto: row.assunto,
    dataPlanejada: row.data_planejada,
    status: row.status,
    observacoes: row.observacoes,
    ordem: row.ordem,
  };
}

export function planoFromRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    titulo: row.titulo,
    dataProva: row.data_prova,
    createdAt: row.created_at,
  };
}

export function cardFromRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    questaoId: row.questao_id,
    caixa: row.caixa,
    proximaRevisao: row.proxima_revisao,
    vezesRevisada: row.vezes_revisada,
    vezesErrada: row.vezes_errada,
    ultimaRevisaoEm: row.ultima_revisao_em,
  };
}
