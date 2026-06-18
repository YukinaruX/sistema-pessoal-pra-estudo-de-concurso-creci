// =============================================================
// Lógica do método Leitner (repetição espaçada, 5 caixas).
// Funções PURAS — sem dependência de UI nem de Supabase — para serem
// testáveis isoladamente (ver verificação em testes locais).
//
// Card (camelCase): { questaoId, caixa, proximaRevisao, vezesRevisada,
//                     vezesErrada, ultimaRevisaoEm }
// Datas são strings 'YYYY-MM-DD' (compatível com a coluna `date` do Postgres).
// =============================================================

export const MAX_CAIXA = 5;

// Intervalos em dias indexados pela caixa de ORIGEM (a caixa em que o card
// estava ao acertar). caixa 1→2 = 1 dia, 2→3 = 3, 3→4 = 7, 4→5 = 14, e
// acertando já na caixa 5 reagenda em 30 dias.
export const INTERVALOS = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };

// Formata um Date como 'YYYY-MM-DD' em horário local.
export function paraDataISO(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

// Soma `dias` a uma data base (string ISO ou Date) e devolve string ISO.
export function somarDias(base, dias) {
  const d = base instanceof Date ? new Date(base) : new Date(`${base}T00:00:00`);
  d.setDate(d.getDate() + dias);
  return paraDataISO(d);
}

// Cria um card novo na caixa 1, com revisão para hoje.
export function inicializarCard(questaoId, hoje) {
  const dataHoje = hoje ? paraDataISO(hoje) : paraDataISO(new Date());
  return {
    questaoId,
    caixa: 1,
    proximaRevisao: dataHoje,
    vezesRevisada: 0,
    vezesErrada: 0,
    ultimaRevisaoEm: null,
  };
}

// Acertou na revisão → avança caixa (máx. 5) e agenda próxima revisão.
export function promoverCard(card, hoje) {
  const dataHoje = hoje || new Date();
  const novaCaixa = Math.min(card.caixa + 1, MAX_CAIXA);
  const intervalo = INTERVALOS[card.caixa] ?? INTERVALOS[MAX_CAIXA];
  return {
    ...card,
    caixa: novaCaixa,
    proximaRevisao: somarDias(dataHoje, intervalo),
    vezesRevisada: card.vezesRevisada + 1,
    ultimaRevisaoEm: dataHoje instanceof Date ? dataHoje.toISOString() : dataHoje,
  };
}

// Errou na revisão → volta para a caixa 1, revisão amanhã.
export function rebaixarCard(card, hoje) {
  const dataHoje = hoje || new Date();
  return {
    ...card,
    caixa: 1,
    proximaRevisao: somarDias(dataHoje, 1),
    vezesRevisada: card.vezesRevisada + 1,
    vezesErrada: card.vezesErrada + 1,
    ultimaRevisaoEm: dataHoje instanceof Date ? dataHoje.toISOString() : dataHoje,
  };
}

// Um card está "vencido" se a próxima revisão é hoje ou já passou.
export function estaVencido(card, hoje) {
  const dataHoje = hoje ? paraDataISO(hoje) : paraDataISO(new Date());
  return card.proximaRevisao <= dataHoje;
}
