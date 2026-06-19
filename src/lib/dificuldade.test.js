import { describe, it, expect } from 'vitest';
import { calcularNivel, construirMapaDificuldade, NIVEIS, ROTULOS, CORES } from './dificuldade.js';

describe('calcularNivel', () => {
  it('nova quando nunca respondida', () => {
    expect(calcularNivel(0, 0)).toBe('nova');
  });

  it('facil quando taxa de erro é 0%', () => {
    expect(calcularNivel(1, 0)).toBe('facil');
    expect(calcularNivel(10, 0)).toBe('facil');
  });

  it('media quando taxa de erro é maior que 0% e menor que 50%', () => {
    expect(calcularNivel(3, 1)).toBe('media'); // 33%
    expect(calcularNivel(10, 4)).toBe('media'); // 40%
    expect(calcularNivel(100, 49)).toBe('media'); // 49%
  });

  it('dificil quando taxa de erro é igual ou maior que 50%', () => {
    expect(calcularNivel(2, 1)).toBe('dificil'); // 50%
    expect(calcularNivel(3, 2)).toBe('dificil'); // 67%
    expect(calcularNivel(1, 1)).toBe('dificil'); // 100%
  });
});

describe('construirMapaDificuldade', () => {
  it('retorna mapa vazio para array vazio', () => {
    expect(construirMapaDificuldade([])).toEqual(new Map());
  });

  it('classifica facil quando todos os acertos são corretos', () => {
    const respostas = [
      { questao_id: 1, correta: true },
      { questao_id: 1, correta: true },
    ];
    expect(construirMapaDificuldade(respostas).get(1)).toBe('facil');
  });

  it('classifica dificil quando 50% ou mais de erros', () => {
    const respostas = [
      { questao_id: 2, correta: false },
      { questao_id: 2, correta: true }, // 50% → dificil
      { questao_id: 3, correta: false },
      { questao_id: 3, correta: false }, // 100% → dificil
    ];
    const mapa = construirMapaDificuldade(respostas);
    expect(mapa.get(2)).toBe('dificil');
    expect(mapa.get(3)).toBe('dificil');
  });

  it('classifica media quando taxa de erro está entre 1% e 49%', () => {
    const respostas = [
      { questao_id: 4, correta: false },
      { questao_id: 4, correta: true },
      { questao_id: 4, correta: true }, // 33% → media
    ];
    expect(construirMapaDificuldade(respostas).get(4)).toBe('media');
  });

  it('questões ausentes do mapa não têm entrada (caller trata como nova)', () => {
    const mapa = construirMapaDificuldade([{ questao_id: 1, correta: true }]);
    expect(mapa.has(99)).toBe(false);
    expect(mapa.get(99)).toBeUndefined();
  });

  it('processa múltiplas questões independentemente', () => {
    const respostas = [
      { questao_id: 10, correta: true },
      { questao_id: 10, correta: true },  // facil
      { questao_id: 20, correta: false },
      { questao_id: 20, correta: true },  // dificil (50%)
      { questao_id: 30, correta: false },
      { questao_id: 30, correta: true },
      { questao_id: 30, correta: true },  // media (33%)
    ];
    const mapa = construirMapaDificuldade(respostas);
    expect(mapa.get(10)).toBe('facil');
    expect(mapa.get(20)).toBe('dificil');
    expect(mapa.get(30)).toBe('media');
  });
});

describe('constantes', () => {
  it('NIVEIS contém exatamente os 4 níveis esperados', () => {
    expect(NIVEIS).toEqual(expect.arrayContaining(['nova', 'facil', 'media', 'dificil']));
    expect(NIVEIS).toHaveLength(4);
  });

  it('ROTULOS tem entrada em português para cada nível', () => {
    for (const n of NIVEIS) {
      expect(typeof ROTULOS[n]).toBe('string');
      expect(ROTULOS[n].length).toBeGreaterThan(0);
    }
  });

  it('CORES tem entrada CSS para cada nível', () => {
    for (const n of NIVEIS) {
      expect(typeof CORES[n]).toBe('string');
      expect(CORES[n].length).toBeGreaterThan(0);
    }
  });
});
