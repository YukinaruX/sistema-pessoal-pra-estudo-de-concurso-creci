// Indicador de carregamento padrão (centralizado).
export default function Loading({ texto = 'Carregando…', minHeight = '40vh' }) {
  return (
    <div
      style={{
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
      }}
    >
      <div className="spinner" />
      <span className="muted-sm">{texto}</span>
    </div>
  );
}
