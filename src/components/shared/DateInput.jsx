import { useRef } from 'react';
import { CalendarDays } from 'lucide-react';

export default function DateInput({ label, id, value, onChange, style, minDate, maxDate }) {
  const ref = useRef(null);

  const formatted = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div style={style}>
      {label && <label className="campo" htmlFor={id}>{label}</label>}
      <button
        type="button"
        id={id}
        className="date-field"
        onClick={() => ref.current?.showPicker?.()}
      >
        <CalendarDays size={16} className="date-field__icon" />
        <span className={formatted ? 'date-field__text' : 'date-field__placeholder'}>
          {formatted ?? 'Selecionar data'}
        </span>
        <input
          ref={ref}
          type="date"
          value={value}
          onChange={onChange}
          min={minDate}
          max={maxDate}
          className="date-field__native"
          tabIndex={-1}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
