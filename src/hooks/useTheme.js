import { useEffect, useState } from 'react';

export function useTheme() {
  const [tema, setTema] = useState(
    () => localStorage.getItem('tema') ?? 'escuro'
  );

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    localStorage.setItem('tema', tema);
  }, [tema]);

  function alternarTema() {
    setTema((t) => (t === 'claro' ? 'escuro' : 'claro'));
  }

  return { tema, alternarTema };
}
