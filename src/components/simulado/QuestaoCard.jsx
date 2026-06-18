import { Check, X, CircleDashed } from 'lucide-react';
import { corDisciplina } from '../../styles/theme.js';

// Botão de alternativa (Certo/Errado). Componente de módulo para não ser
// recriado a cada render do card.
function Opcao({ valor, rotulo, icone: Icone, resposta, gabarito, revelar, onResponder }) {
  const selecionado = resposta === valor;
  let fundo = 'var(--superficie)';
  let borda = 'var(--borda)';

  if (revelar) {
    if (valor === gabarito) {
      fundo = 'rgba(34,197,94,0.16)';
      borda = 'var(--sucesso)';
    } else if (selecionado) {
      fundo = 'rgba(239,68,68,0.16)';
      borda = 'var(--erro)';
    }
  } else if (selecionado) {
    fundo = 'rgba(37,99,235,0.22)';
    borda = 'var(--azul-claro)';
  }

  return (
    <button
      type="button"
      disabled={revelar}
      onClick={() => onResponder(selecionado ? null : valor)}
      className="btn"
      style={{
        flex: 1,
        minWidth: 110,
        background: fundo,
        borderColor: borda,
        color: 'var(--texto)',
        cursor: revelar ? 'default' : 'pointer',
      }}
    >
      <Icone size={17} />
      {rotulo}
    </button>
  );
}

// Renderiza uma questão: enunciado, badge de disciplina, botões Certo/Errado/
// Em branco. Quando `revelar` é true (modo gabarito), mostra a correção e a
// explicação. `resposta` é 'C' | 'E' | null.
export default function QuestaoCard({
  questao,
  numero,
  total,
  resposta,
  onResponder,
  revelar = false,
}) {
  const cor = corDisciplina(questao.disciplina);
  const acertou = resposta && resposta === questao.gabarito;

  return (
    <article className="card surgir" style={{ borderLeft: `4px solid ${cor}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <span className="badge" style={{ background: cor }}>
          {questao.disciplina}
        </span>
        <span className="muted-sm">{questao.assunto}</span>
        <span className="muted-sm" style={{ marginLeft: 'auto' }}>
          Questão {numero} / {total}
        </span>
      </div>

      <p style={{ fontSize: 16, lineHeight: 1.65, marginBottom: 18 }}>{questao.enunciado}</p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Opcao
          valor="C"
          rotulo="Certo"
          icone={Check}
          resposta={resposta}
          gabarito={questao.gabarito}
          revelar={revelar}
          onResponder={onResponder}
        />
        <Opcao
          valor="E"
          rotulo="Errado"
          icone={X}
          resposta={resposta}
          gabarito={questao.gabarito}
          revelar={revelar}
          onResponder={onResponder}
        />
        {!revelar && (
          <button
            type="button"
            className="btn btn-fantasma"
            onClick={() => onResponder(null)}
            style={{ minWidth: 110 }}
          >
            <CircleDashed size={16} /> Em branco
          </button>
        )}
      </div>

      {revelar && (
        <div
          className="surgir"
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 'var(--raio-md)',
            background: acertou ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)',
            border: `1px solid ${acertou ? 'var(--sucesso)' : 'var(--erro)'}`,
          }}
        >
          <strong style={{ color: acertou ? 'var(--sucesso)' : 'var(--erro)' }}>
            {resposta ? (acertou ? 'Você acertou' : 'Você errou') : 'Em branco'} · Gabarito:{' '}
            {questao.gabarito === 'C' ? 'Certo' : 'Errado'}
          </strong>
          <p style={{ marginTop: 8, lineHeight: 1.6, fontSize: 14 }}>{questao.explicacao}</p>
        </div>
      )}
    </article>
  );
}
