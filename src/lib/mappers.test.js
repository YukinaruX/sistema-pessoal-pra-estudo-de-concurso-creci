import { describe, it, expect } from 'vitest';
import {
  questaoFromRow,
  tentativaFromRow,
  respostaFromRow,
  planoItemFromRow,
  planoFromRow,
  cardFromRow,
} from './mappers.js';

describe('questaoFromRow', () => {
  it('mapeia snake_case para camelCase', () => {
    const row = {
      id: 1,
      simulado_id: 'uuid-1',
      disciplina: 'Matemática',
      assunto: 'Álgebra',
      enunciado: 'Texto da questão',
      gabarito: 'C',
      explicacao: 'Explicação',
      ordem: 5,
    };
    expect(questaoFromRow(row)).toEqual({
      id: 1,
      simuladoId: 'uuid-1',
      disciplina: 'Matemática',
      assunto: 'Álgebra',
      enunciado: 'Texto da questão',
      gabarito: 'C',
      explicacao: 'Explicação',
      ordem: 5,
    });
  });
});

describe('tentativaFromRow', () => {
  const row = {
    id: 'uuid-t',
    user_id: 'uuid-u',
    simulado_id: 'uuid-s',
    iniciado_em: '2026-01-01T10:00:00Z',
    finalizado_em: null,
    tempo_segundos: 120,
    total_certas: 8,
    total_erradas: 2,
    total_brancos: 0,
    percentual: 80,
    status: 'finalizado',
    questoes_ids: [3, 1, 2],
  };

  it('mapeia campos básicos', () => {
    const t = tentativaFromRow(row);
    expect(t.id).toBe('uuid-t');
    expect(t.userId).toBe('uuid-u');
    expect(t.simuladoId).toBe('uuid-s');
    expect(t.tempoSegundos).toBe(120);
    expect(t.totalCertas).toBe(8);
    expect(t.status).toBe('finalizado');
  });

  it('mapeia questoesIds corretamente', () => {
    expect(tentativaFromRow(row).questoesIds).toEqual([3, 1, 2]);
  });

  it('retorna null para questoesIds quando ausente no banco', () => {
    expect(tentativaFromRow({ ...row, questoes_ids: null }).questoesIds).toBeNull();
    expect(tentativaFromRow({ ...row, questoes_ids: undefined }).questoesIds).toBeNull();
  });
});

describe('respostaFromRow', () => {
  it('mapeia snake_case para camelCase', () => {
    const row = {
      id: 'uuid-r',
      tentativa_id: 'uuid-t',
      questao_id: 42,
      resposta: 'C',
      correta: true,
      respondido_em: '2026-01-01T10:00:00Z',
    };
    expect(respostaFromRow(row)).toEqual({
      id: 'uuid-r',
      tentativaId: 'uuid-t',
      questaoId: 42,
      resposta: 'C',
      correta: true,
      respondidoEm: '2026-01-01T10:00:00Z',
    });
  });
});

describe('planoFromRow', () => {
  it('mapeia snake_case para camelCase', () => {
    const row = {
      id: 'uuid-p',
      user_id: 'uuid-u',
      titulo: 'Meu plano',
      data_prova: '2026-06-01',
      created_at: '2026-01-01T00:00:00Z',
    };
    expect(planoFromRow(row)).toEqual({
      id: 'uuid-p',
      userId: 'uuid-u',
      titulo: 'Meu plano',
      dataProva: '2026-06-01',
      createdAt: '2026-01-01T00:00:00Z',
    });
  });
});

describe('planoItemFromRow', () => {
  it('mapeia snake_case para camelCase', () => {
    const row = {
      id: 'uuid-i',
      plano_id: 'uuid-p',
      disciplina: 'Português',
      assunto: 'Sintaxe',
      data_planejada: '2026-02-01',
      status: 'pendente',
      observacoes: 'obs',
      ordem: 1,
    };
    expect(planoItemFromRow(row)).toEqual({
      id: 'uuid-i',
      planoId: 'uuid-p',
      disciplina: 'Português',
      assunto: 'Sintaxe',
      dataPlanejada: '2026-02-01',
      status: 'pendente',
      observacoes: 'obs',
      ordem: 1,
    });
  });
});

describe('cardFromRow', () => {
  it('mapeia snake_case para camelCase', () => {
    const row = {
      id: 'uuid-c',
      user_id: 'uuid-u',
      questao_id: 7,
      caixa: 3,
      proxima_revisao: '2026-01-20',
      vezes_revisada: 4,
      vezes_errada: 1,
      ultima_revisao_em: '2026-01-15T10:00:00Z',
    };
    expect(cardFromRow(row)).toEqual({
      id: 'uuid-c',
      userId: 'uuid-u',
      questaoId: 7,
      caixa: 3,
      proximaRevisao: '2026-01-20',
      vezesRevisada: 4,
      vezesErrada: 1,
      ultimaRevisaoEm: '2026-01-15T10:00:00Z',
    });
  });
});
