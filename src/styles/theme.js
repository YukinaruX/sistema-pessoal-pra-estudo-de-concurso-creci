// Tokens de estilo — Duolingo style
// Verde coruja #58cc02, sombras táteis, Nunito arredondada.

export const theme = {
  cores: {
    verde:        '#58cc02',
    verdeEscuro:  '#58a700',
    verdeClaro:   '#89e219',
    verdePalido:  '#dbf8c5',
    laranja:      '#ff9600',
    laranjaEscuro:'#cc7a00',
    rosa:         '#ce82ff',
    azulInfo:     '#1cb0f6',
    vermelho:     '#ff4b4b',
    amarelo:      '#ffc800',
    neve:         '#ffffff',
    enguia:       '#f7f7f7',
    cisne:        '#e5e5e5',
    lobo:         '#777777',
    tinta:        '#3c3c3c',
    lebre:        '#afafaf',
    gradiente:    'linear-gradient(135deg, #58a700 0%, #58cc02 100%)',
  },
  raio: { sm: '8px', md: '16px', lg: '20px', pill: '9999px' },
  sombra: {
    card: '0 2px 0 #e5e5e5',
    btn:  '0 4px 0',
    foco: '0 0 0 3px rgba(28,176,246,0.25)',
  },
};

// Cor de badge por disciplina
const BADGES = {
  'Português':               '#8B5CF6',
  'Matemática':              '#1cb0f6',
  'Noções de Informática':   '#58cc02',
  'Conhecimentos Específicos':'#ff9600',
  'Legislação e Ética':      '#ce82ff',
};

export function corDisciplina(disciplina) {
  return BADGES[disciplina] || '#777777';
}
