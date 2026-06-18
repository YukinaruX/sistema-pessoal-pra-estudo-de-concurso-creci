import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.js';
import { formatarTempo } from '../../lib/estatisticas.js';

const INTERVALO_SAVE_MS = 15000; // salvamento periódico de segurança

// Cronômetro isolado: mantém o "tick" de 1 segundo no SEU PRÓPRIO estado, para
// não re-renderizar a página inteira do simulado a cada segundo. Pausa quando a
// aba fica oculta ou o componente é desmontado, salva o tempo periodicamente e
// em cada pausa, e expõe getTempo()/travar() ao componente pai (para finalizar).
const Cronometro = forwardRef(function Cronometro({ tentativaId, tempoInicial }, ref) {
  const [segundos, setSegundos] = useState(tempoInicial || 0);
  const baseRef = useRef(tempoInicial || 0); // segundos acumulados antes desta sessão
  const sessaoInicioRef = useRef(null); // ms do início da sessão ativa (null = pausado)
  const travadoRef = useRef(false); // trava a persistência (usado ao finalizar)

  // API imperativa para o pai: lê o tempo atual e trava/destrava a persistência.
  useImperativeHandle(
    ref,
    () => ({
      getTempo: () =>
        baseRef.current +
        (sessaoInicioRef.current ? Math.floor((Date.now() - sessaoInicioRef.current) / 1000) : 0),
      travar: (valor = true) => {
        travadoRef.current = valor;
      },
    }),
    []
  );

  useEffect(() => {
    if (tentativaId == null) return undefined;
    baseRef.current = tempoInicial || 0;
    sessaoInicioRef.current = Date.now();
    setSegundos(baseRef.current);

    const calc = () =>
      baseRef.current +
      (sessaoInicioRef.current ? Math.floor((Date.now() - sessaoInicioRef.current) / 1000) : 0);

    const persistir = (total) => {
      if (travadoRef.current) return;
      supabase.from('tentativas').update({ tempo_segundos: total }).eq('id', tentativaId);
    };

    const tick = setInterval(() => setSegundos(calc()), 1000);
    const save = setInterval(() => {
      if (sessaoInicioRef.current) persistir(calc());
    }, INTERVALO_SAVE_MS);

    const pausar = () => {
      if (sessaoInicioRef.current == null) return;
      baseRef.current = calc();
      sessaoInicioRef.current = null;
      setSegundos(baseRef.current);
      persistir(baseRef.current);
    };
    const retomar = () => {
      if (sessaoInicioRef.current == null) sessaoInicioRef.current = Date.now();
    };
    const aoMudarVisibilidade = () => (document.hidden ? pausar() : retomar());

    document.addEventListener('visibilitychange', aoMudarVisibilidade);
    window.addEventListener('pagehide', pausar);

    return () => {
      clearInterval(tick);
      clearInterval(save);
      document.removeEventListener('visibilitychange', aoMudarVisibilidade);
      window.removeEventListener('pagehide', pausar);
      pausar(); // ao sair (navegar/desmontar), acumula e salva o tempo decorrido
    };
  }, [tentativaId, tempoInicial]);

  return (
    <div
      className="badge"
      style={{ background: 'var(--superficie-2)', gap: 6, fontSize: 14, padding: '7px 14px' }}
    >
      <Clock size={15} /> {formatarTempo(segundos)}
    </div>
  );
});

export default Cronometro;
