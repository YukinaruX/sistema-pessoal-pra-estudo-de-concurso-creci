import { describe, it, expect } from 'vitest';
import {
  resumoRespostas,
  desempenhoPorDisciplina,
  formatarTempo,
  diasAteProva,
} from './estatisticas.js';

describe('resumoRespostas', () => {
  it('conta certas, erradas e brancos corretamente', () => {
    const respostas = [
      { resposta: 'C', correta: true },
      { resposta: 'E', correta: false },
      { resposta: null, correta: null },
    ];
    const r = resumoRespostas(respostas, 3);
    expect(r.certas).toBe(1);
    expect(r.erradas).toBe(1);
    expect(r.brancos).toBe(1);
    expect(r.respondidas).toBe(2);
    expect(r.total).toBe(3);
  });

  it('calcula percentual baseado no total de questões (não só respondidas)', () => {
    const respostas = [
      { resposta: 'C', correta: true },
      { resposta: 'C', correta: true },
      { resposta: null, correta: null },
      { resposta: null, correta: null },
    ];
    const r = resumoRespostas(respostas, 4);
    expect(r.percentual).toBe(50);
  });

  it('retorna percentual 0 quando totalQuestoes é 0', () => {
    const r = resumoRespostas([], 0);
    expect(r.percentual).toBe(0);
  });

  it('retorna brancos 0 quando todas as questões foram respondidas', () => {
    const respostas = [
      { resposta: 'C', correta: true },
      { resposta: 'E', correta: false },
    ];
    const r = resumoRespostas(respostas, 2);
    expect(r.brancos).toBe(0);
  });

  it('arredonda percentual a 1 casa decimal', () => {
    const respostas = Array(3).fill({ resposta: 'C', correta: true });
    const r = resumoRespostas(respostas, 9);
    expect(r.percentual).toBe(33.3);
  });
});

describe('desempenhoPorDisciplina', () => {
  const respostas = [
    { disciplina: 'Matemática', correta: true },
    { disciplina: 'Matemática', correta: false },
    { disciplina: 'Matemática', correta: true },
    { disciplina: 'Português', correta: true },
    { disciplina: 'Português', correta: true },
  ];

  it('agrupa por disciplina corretamente', () => {
    const resultado = desempenhoPorDisciplina(respostas);
    const mat = resultado.find((d) => d.disciplina === 'Matemática');
    const por = resultado.find((d) => d.disciplina === 'Português');
    expect(mat.total).toBe(3);
    expect(mat.certas).toBe(2);
    expect(por.total).toBe(2);
    expect(por.certas).toBe(2);
  });

  it('calcula percentual por disciplina', () => {
    const resultado = desempenhoPorDisciplina(respostas);
    const mat = resultado.find((d) => d.disciplina === 'Matemática');
    expect(mat.percentual).toBe(66.7);
  });

  it('ignora entradas sem disciplina', () => {
    const comNulo = [...respostas, { disciplina: null, correta: true }];
    const resultado = desempenhoPorDisciplina(comNulo);
    expect(resultado).toHaveLength(2);
  });
});

describe('formatarTempo', () => {
  it('formata segundos como MM:SS quando menos de 1 hora', () => {
    expect(formatarTempo(0)).toBe('00:00');
    expect(formatarTempo(59)).toBe('00:59');
    expect(formatarTempo(61)).toBe('01:01');
    expect(formatarTempo(3599)).toBe('59:59');
  });

  it('formata como HH:MM:SS quando 1 hora ou mais', () => {
    expect(formatarTempo(3600)).toBe('01:00:00');
    expect(formatarTempo(3661)).toBe('01:01:01');
    expect(formatarTempo(7384)).toBe('02:03:04');
  });

  it('trata valores nulos/undefined como 0', () => {
    expect(formatarTempo(null)).toBe('00:00');
    expect(formatarTempo(undefined)).toBe('00:00');
  });

  it('trata valores negativos como 0', () => {
    expect(formatarTempo(-10)).toBe('00:00');
  });
});

describe('diasAteProva', () => {
  it('retorna null quando dataProva não é fornecida', () => {
    expect(diasAteProva(null)).toBeNull();
    expect(diasAteProva(undefined)).toBeNull();
  });

  it('retorna 0 quando a prova é hoje', () => {
    const hoje = new Date();
    const dataProva = hoje.toISOString().split('T')[0];
    expect(diasAteProva(dataProva, hoje)).toBe(0);
  });

  it('retorna dias positivos para provas futuras', () => {
    const hoje = new Date(2026, 0, 15); // 15 jan 2026 em horário local
    expect(diasAteProva('2026-01-20', hoje)).toBe(5);
    expect(diasAteProva('2026-02-14', hoje)).toBe(30);
  });

  it('retorna dias negativos para provas passadas', () => {
    const hoje = new Date(2026, 0, 15); // 15 jan 2026 em horário local
    expect(diasAteProva('2026-01-10', hoje)).toBe(-5);
  });
});
