import { describe, it, expect } from 'vitest';
import {
  MAX_CAIXA,
  INTERVALOS,
  paraDataISO,
  somarDias,
  inicializarCard,
  promoverCard,
  rebaixarCard,
  estaVencido,
} from './leitner.js';

const HOJE = new Date('2026-01-15T12:00:00');
const HOJE_ISO = '2026-01-15';

describe('paraDataISO', () => {
  it('formata Date como YYYY-MM-DD em horário local', () => {
    expect(paraDataISO(new Date('2026-01-05T10:00:00'))).toBe('2026-01-05');
  });

  it('zero-padding no mês e dia', () => {
    expect(paraDataISO(new Date('2026-03-09T00:00:00'))).toBe('2026-03-09');
  });
});

describe('somarDias', () => {
  it('soma dias a uma string ISO', () => {
    expect(somarDias('2026-01-15', 1)).toBe('2026-01-16');
    expect(somarDias('2026-01-15', 7)).toBe('2026-01-22');
    expect(somarDias('2026-01-15', 30)).toBe('2026-02-14');
  });

  it('soma dias a um objeto Date', () => {
    expect(somarDias(HOJE, 3)).toBe('2026-01-18');
  });

  it('atravessa virada de mês corretamente', () => {
    expect(somarDias('2026-01-31', 1)).toBe('2026-02-01');
  });

  it('atravessa virada de ano corretamente', () => {
    expect(somarDias('2025-12-31', 1)).toBe('2026-01-01');
  });
});

describe('inicializarCard', () => {
  it('cria card na caixa 1 com proxima revisão hoje', () => {
    const card = inicializarCard(42, HOJE);
    expect(card.questaoId).toBe(42);
    expect(card.caixa).toBe(1);
    expect(card.proximaRevisao).toBe(HOJE_ISO);
    expect(card.vezesRevisada).toBe(0);
    expect(card.vezesErrada).toBe(0);
    expect(card.ultimaRevisaoEm).toBeNull();
  });

  it('usa a data de hoje quando nenhuma data é fornecida', () => {
    const card = inicializarCard(1);
    expect(card.proximaRevisao).toBe(paraDataISO(new Date()));
  });
});

describe('promoverCard', () => {
  it('avança da caixa 1 para 2 com intervalo de 1 dia', () => {
    const card = inicializarCard(1, HOJE);
    const promovido = promoverCard(card, HOJE);
    expect(promovido.caixa).toBe(2);
    expect(promovido.proximaRevisao).toBe(somarDias(HOJE, INTERVALOS[1]));
    expect(promovido.vezesRevisada).toBe(1);
    expect(promovido.vezesErrada).toBe(0);
  });

  it('avança da caixa 2 para 3 com intervalo de 3 dias', () => {
    const card = { ...inicializarCard(1, HOJE), caixa: 2 };
    const promovido = promoverCard(card, HOJE);
    expect(promovido.caixa).toBe(3);
    expect(promovido.proximaRevisao).toBe(somarDias(HOJE, INTERVALOS[2]));
  });

  it('não ultrapassa a caixa máxima (5)', () => {
    const card = { ...inicializarCard(1, HOJE), caixa: MAX_CAIXA };
    const promovido = promoverCard(card, HOJE);
    expect(promovido.caixa).toBe(MAX_CAIXA);
    expect(promovido.proximaRevisao).toBe(somarDias(HOJE, INTERVALOS[MAX_CAIXA]));
  });

  it('acumula vezesRevisada corretamente', () => {
    let card = inicializarCard(1, HOJE);
    card = promoverCard(card, HOJE);
    card = promoverCard(card, HOJE);
    expect(card.vezesRevisada).toBe(2);
  });
});

describe('rebaixarCard', () => {
  it('reseta para caixa 1 e agenda revisão para amanhã', () => {
    const card = { ...inicializarCard(1, HOJE), caixa: 3 };
    const rebaixado = rebaixarCard(card, HOJE);
    expect(rebaixado.caixa).toBe(1);
    expect(rebaixado.proximaRevisao).toBe(somarDias(HOJE, 1));
    expect(rebaixado.vezesErrada).toBe(1);
    expect(rebaixado.vezesRevisada).toBe(1);
  });

  it('acumula vezesErrada a cada rebaixamento', () => {
    let card = inicializarCard(1, HOJE);
    card = rebaixarCard(card, HOJE);
    card = promoverCard(card, HOJE);
    card = rebaixarCard(card, HOJE);
    expect(card.vezesErrada).toBe(2);
  });
});

describe('estaVencido', () => {
  it('retorna true quando proxima revisão é hoje', () => {
    const card = inicializarCard(1, HOJE);
    expect(estaVencido(card, HOJE)).toBe(true);
  });

  it('retorna true quando proxima revisão está no passado', () => {
    const card = { ...inicializarCard(1, HOJE), proximaRevisao: '2026-01-01' };
    expect(estaVencido(card, HOJE)).toBe(true);
  });

  it('retorna false quando proxima revisão está no futuro', () => {
    const card = { ...inicializarCard(1, HOJE), proximaRevisao: '2026-12-31' };
    expect(estaVencido(card, HOJE)).toBe(false);
  });
});
