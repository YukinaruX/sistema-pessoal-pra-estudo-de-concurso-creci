import { useState } from 'react';
import { Eye, Check, X } from 'lucide-react';
import { corDisciplina } from '../../styles/theme.js';

// Flashcard de revisão: mostra o enunciado, revela o gabarito/explicação ao
// clicar e classifica em acertou/errou para mover de caixa (Leitner).
export default function FlashcardRevisao({ questao, caixa, onClassificar }) {
  const [revelado, setRevelado] = useState(false);
  const cor = corDisciplina(questao.disciplina);

  function classificar(acertou) {
    setRevelado(false);
    onClassificar(acertou);
  }

  return (
    <article className="card" style={{ borderLeft: `4px solid ${cor}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <span className="badge" style={{ background: cor }}>
          {questao.disciplina}
        </span>
        <span className="muted-sm">{questao.assunto}</span>
        <span className="badge" style={{ background: 'var(--superficie-2)', marginLeft: 'auto' }}>
          Caixa {caixa}/5
        </span>
      </div>

      <p style={{ fontSize: 16, lineHeight: 1.65, marginBottom: 18 }}>{questao.enunciado}</p>

      {!revelado ? (
        <button className="btn btn-secundario" onClick={() => setRevelado(true)} style={{ width: '100%' }}>
          <Eye size={17} /> Revelar resposta
        </button>
      ) : (
        <>
          <div
            className="surgir"
            style={{
              padding: 14,
              borderRadius: 'var(--raio-md)',
              background: 'rgba(37,99,235,0.10)',
              border: '1px solid var(--azul-claro)',
              marginBottom: 14,
            }}
          >
            <strong>Gabarito: {questao.gabarito === 'C' ? 'Certo' : 'Errado'}</strong>
            <p style={{ marginTop: 8, lineHeight: 1.6, fontSize: 14 }}>{questao.explicacao}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn"
              onClick={() => classificar(false)}
              style={{ flex: 1, background: 'rgba(239,68,68,0.16)', borderColor: 'var(--erro)' }}
            >
              <X size={17} /> Errei
            </button>
            <button
              className="btn"
              onClick={() => classificar(true)}
              style={{ flex: 1, background: 'rgba(34,197,94,0.16)', borderColor: 'var(--sucesso)' }}
            >
              <Check size={17} /> Acertei
            </button>
          </div>
        </>
      )}
    </article>
  );
}
