import { createContext } from 'react';

// Contexto separado do provider para manter o fast-refresh feliz
// (arquivo de componente exporta só componentes).
export const AuthContext = createContext(null);
