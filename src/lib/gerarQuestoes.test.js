import { describe, it, expect } from 'vitest';
import { estoqueEsgotado, validarQuestaoGerada } from './gerarQuestoes.js';

describe('estoqueEsgotado', () => {
  it('falso quando não há questões', () => {
    expect(estoqueEsgotado([], new Map())).toBe(false);
  });

  it('falso quando dificuldades está vazia e há questões', () => {
    const questoes = [{ id: 1 }, { id: 2 }];
    expect(estoqueEsgotado(questoes, new Map())).toBe(false);
  });

  it('falso quando ao menos uma questão não foi respondida', () => {
    const questoes = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const dificuldades = new Map([[1, 'facil'], [2, 'dificil']]);
    expect(estoqueEsgotado(questoes, dificuldades)).toBe(false);
  });

  it('verdadeiro quando todas as questões foram respondidas ao menos uma vez', () => {
    const questoes = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const dificuldades = new Map([[1, 'facil'], [2, 'dificil'], [3, 'media']]);
    expect(estoqueEsgotado(questoes, dificuldades)).toBe(true);
  });

  it('verdadeiro com uma única questão respondida', () => {
    const questoes = [{ id: 42 }];
    const dificuldades = new Map([[42, 'nova']]);
    expect(estoqueEsgotado(questoes, dificuldades)).toBe(true);
  });
});

describe('validarQuestaoGerada', () => {
  const valida = {
    disciplina: 'Português',
    assunto: 'Interpretação de Texto',
    enunciado: 'Texto de exemplo para a questão.',
    gabarito: 'C',
    explicacao: 'Esta é a explicação da questão.',
  };

  it('válida quando todos os campos estão presentes e corretos', () => {
    expect(validarQuestaoGerada(valida)).toBe(true);
  });

  it('válida com gabarito E', () => {
    expect(validarQuestaoGerada({ ...valida, gabarito: 'E' })).toBe(true);
  });

  it('inválida quando gabarito não é C ou E', () => {
    expect(validarQuestaoGerada({ ...valida, gabarito: 'X' })).toBe(false);
    expect(validarQuestaoGerada({ ...valida, gabarito: '' })).toBe(false);
    expect(validarQuestaoGerada({ ...valida, gabarito: 'c' })).toBe(false);
  });

  it('inválida quando disciplina está vazia', () => {
    expect(validarQuestaoGerada({ ...valida, disciplina: '' })).toBe(false);
    expect(validarQuestaoGerada({ ...valida, disciplina: '   ' })).toBe(false);
  });

  it('inválida quando assunto está vazio', () => {
    expect(validarQuestaoGerada({ ...valida, assunto: '' })).toBe(false);
  });

  it('inválida quando enunciado está vazio', () => {
    expect(validarQuestaoGerada({ ...valida, enunciado: '' })).toBe(false);
  });

  it('inválida quando explicacao está vazia', () => {
    expect(validarQuestaoGerada({ ...valida, explicacao: '' })).toBe(false);
  });

  it('inválida quando questão não é objeto', () => {
    expect(validarQuestaoGerada(null)).toBe(false);
    expect(validarQuestaoGerada(undefined)).toBe(false);
    expect(validarQuestaoGerada('string')).toBe(false);
    expect(validarQuestaoGerada(42)).toBe(false);
  });

  it('inválida quando campo obrigatório está ausente', () => {
    const { disciplina: _d, ...semDisciplina } = valida;
    const { enunciado: _e, ...semEnunciado } = valida;
    expect(validarQuestaoGerada(semDisciplina)).toBe(false);
    expect(validarQuestaoGerada(semEnunciado)).toBe(false);
  });
});
