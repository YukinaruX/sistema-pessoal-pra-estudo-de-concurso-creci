// Tokens de estilo compartilhados (cores, espaçamentos, badges por disciplina).
// Mantém o esquema visual validado no protótipo: gradiente azul #1E3A5F → #2563EB.

export const theme = {
  cores: {
    azulEscuro: '#1E3A5F',
    azul: '#2563EB',
    azulClaro: '#3B82F6',
    gradiente: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)',
    fundo: '#0F172A',
    superficie: 'rgba(255,255,255,0.06)',
    superficieSolida: '#1E293B',
    borda: 'rgba(255,255,255,0.10)',
    texto: '#F1F5F9',
    textoFraco: '#94A3B8',
    sucesso: '#22C55E',
    erro: '#EF4444',
    alerta: '#F59E0B',
  },
  raio: { sm: '8px', md: '14px', lg: '20px', pill: '999px' },
  sombra: {
    card: '0 8px 30px rgba(0,0,0,0.25)',
    foco: '0 0 0 3px rgba(37,99,235,0.35)',
  },
};

// Cor de badge por disciplina. Disciplinas não mapeadas caem no fallback.
const BADGES = {
  Português: '#8B5CF6',
  Matemática: '#06B6D4',
  'Noções de Informática': '#10B981',
  'Conhecimentos Específicos': '#2563EB',
  'Legislação e Ética': '#F59E0B',
};

export function corDisciplina(disciplina) {
  return BADGES[disciplina] || '#64748B';
}
