# AGENTS.md — Sistema de Estudos CRECI-BA

Guia para qualquer agente de IA (Claude Code, Cursor, etc.) que for trabalhar neste
repositório. Leia isto antes de gerar ou alterar código.

## 1. O que é este projeto

Sistema pessoal de estudos para o concurso do **CRECI-BA** (banca Quadrix, nível
médio, 100 questões certo/errado). É de uso individual (o dono do projeto), mas fica
hospedado publicamente (Netlify ou Vercel), então tem login e os dados de cada usuário
ficam isolados por Row Level Security no banco.

O sistema tem três módulos:

1. **Simulado** — refazer a prova completa ou filtrada por disciplina, com cronômetro,
   gabarito comentado e progresso salvo automaticamente (dá para fechar e continuar
   depois de onde parou).
2. **Histórico** — todas as tentativas finalizadas, com nota, tempo e desempenho por
   disciplina, para acompanhar evolução ao longo do tempo.
3. **Plano de estudos** — cronograma com data da prova, itens por disciplina/assunto,
   com status (pendente / em andamento / concluído).
4. **Revisão de erros** — todo item que o usuário errou entra automaticamente num
   sistema de repetição espaçada (Leitner, 5 caixas) para reaparecer em intervalos
   crescentes até ser dominado.

A base de 100 questões já existe (extraída de um artifact anterior em React) e deve
ser usada como seed do banco, não redigitada.

## 2. Stack

- **Frontend**: Vite + React (JavaScript, sem TypeScript por padrão — manter assim a
  menos que o usuário peça o contrário).
- **Roteamento**: `react-router-dom`.
- **Backend/dados**: Supabase (Postgres + Auth + Row Level Security). Sem backend
  próprio — o frontend fala direto com o Supabase via `@supabase/supabase-js`.
- **Auth**: Supabase Auth, e-mail + senha (sem necessidade de OAuth social).
- **Deploy**: Netlify ou Vercel, build estático do Vite (`dist/`).
- **Estilo**: CSS-in-JS inline (como no protótipo original) ou CSS Modules — evitar
  Tailwind a menos que seja pedido, para manter o app leve.

## 3. Estrutura de pastas esperada

```
/src
  /pages
    Login.jsx
    Dashboard.jsx
    Simulado.jsx
    ResultadoTentativa.jsx
    Historico.jsx
    PlanoEstudos.jsx
    Revisao.jsx
  /components
    /simulado      (QuestaoCard, FiltroDisciplina, BarraResumo)
    /plano         (ItemPlano, FormNovoItem)
    /revisao       (FlashcardRevisao)
    /shared        (Layout, Navbar, Loading, ProtectedRoute)
  /lib
    supabaseClient.js
    leitner.js        (lógica do sistema de repetição espaçada)
  /hooks
    useAuth.js
    useTentativaAtiva.js
  /data
    seedQuestoes.js    (as 100 questões originais, usadas só para popular o banco)
  /styles
    theme.js           (cores e tokens compartilhados)
/supabase
  /migrations
    0001_init.sql
  seed.sql
.env.example
netlify.toml  (ou vercel.json)
package.json
```

## 4. Banco de dados (Supabase)

Todas as tabelas de dados pessoais têm RLS habilitado e uma policy restringindo
`auth.uid() = user_id`. `questoes` e `simulados` são de leitura pública (conteúdo da
prova), escrita restrita a service role.

```sql
-- conteúdo da prova (pode ter mais de um simulado no futuro)
create table simulados (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  banca text,
  total_questoes int,
  created_at timestamptz default now()
);

create table questoes (
  id serial primary key,
  simulado_id uuid references simulados(id) on delete cascade,
  disciplina text not null,
  assunto text not null,
  enunciado text not null,
  gabarito text not null check (gabarito in ('C','E')),
  explicacao text not null,
  ordem int
);

-- tentativas de prova
create table tentativas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  simulado_id uuid references simulados(id),
  iniciado_em timestamptz default now(),
  finalizado_em timestamptz,
  tempo_segundos int default 0,
  total_certas int,
  total_erradas int,
  total_brancos int,
  percentual numeric,
  status text default 'em_andamento' check (status in ('em_andamento','finalizado'))
);

create table respostas (
  id uuid primary key default gen_random_uuid(),
  tentativa_id uuid references tentativas(id) on delete cascade not null,
  questao_id int references questoes(id) not null,
  resposta text check (resposta in ('C','E')),
  correta boolean,
  respondido_em timestamptz default now(),
  unique (tentativa_id, questao_id)
);

-- plano de estudos
create table planos_estudo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  titulo text not null,
  data_prova date,
  created_at timestamptz default now()
);

create table plano_itens (
  id uuid primary key default gen_random_uuid(),
  plano_id uuid references planos_estudo(id) on delete cascade not null,
  disciplina text not null,
  assunto text,
  data_planejada date,
  status text default 'pendente' check (status in ('pendente','em_andamento','concluido')),
  observacoes text,
  ordem int
);

-- revisão de erros (Leitner: 5 caixas)
create table revisao_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  questao_id int references questoes(id) not null,
  caixa int default 1,
  proxima_revisao date default current_date,
  vezes_revisada int default 0,
  vezes_errada int default 0,
  ultima_revisao_em timestamptz,
  unique (user_id, questao_id)
);
```

Habilitar RLS e policies básicas em `tentativas`, `respostas`, `planos_estudo`,
`plano_itens` e `revisao_cards`:

```sql
alter table tentativas enable row level security;
create policy "usuario ve suas tentativas" on tentativas
  for all using (auth.uid() = user_id);
-- repetir o padrão para as demais tabelas com user_id
```

### Lógica de revisão (Leitner)

Ao errar uma questão numa tentativa finalizada, criar (ou resetar para `caixa = 1`) um
registro em `revisao_cards`. Ao revisar e acertar, avançar a caixa (`caixa + 1`, máx.
5) e recalcular `proxima_revisao` com intervalos crescentes (ex.: 1, 3, 7, 14, 30
dias). Ao errar de novo na revisão, voltar para `caixa = 1`. Essa lógica fica isolada
em `src/lib/leitner.js` para ser testável sem depender da UI.

## 5. Variáveis de ambiente

`.env.example`:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Nunca commitar `.env` real. A anon key do Supabase é segura para expor no frontend
desde que a RLS esteja corretamente configurada — não usar a service role key no
cliente.

## 6. Comandos

```bash
npm install
npm run dev        # ambiente local
npm run build       # gera dist/ para deploy
npm run preview     # testa o build localmente
```

Migrações do banco ficam em `supabase/migrations`; aplicar via Supabase CLI
(`supabase db push`) ou colando direto no SQL Editor do painel do Supabase.

## 7. Convenções

- Textos de interface em português (pt-BR), igual ao protótipo original.
- Nomes de colunas no banco em `snake_case`; nomes de variáveis/props no React em
  `camelCase`. Fazer o mapeamento na camada `/lib`, não espalhar `snake_case` pela UI.
- Manter o esquema visual já validado no protótipo (gradiente azul `#1E3A5F → #2563EB`,
  badges coloridos por disciplina, cards com borda colorida) — não redesenhar sem
  necessidade.
- Cada página que lê/escreve no Supabase deve tratar estado de loading e erro
  explicitamente (sem tela em branco silenciosa).
- Evitar duplicar a lógica de cálculo de estatísticas (certas/erradas/percentual) em
  mais de um lugar — centralizar em `src/lib`.

## 8. Deploy

**Netlify** (`netlify.toml`):

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Vercel** (`vercel.json`):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

O redirect/rewrite para `index.html` é obrigatório porque o app usa rotas client-side
(`react-router-dom`) — sem isso, recarregar a página em `/historico` ou `/plano` dá
404. Configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas variáveis de
ambiente do painel da Netlify/Vercel, não só localmente.

## 9. Roadmap (ordem sugerida de implementação)

1. Scaffold do Vite + React, Supabase client, tela de login.
2. Migrar as 100 questões do protótipo para o banco (`seed.sql` ou script Node usando
   `seedQuestoes.js`).
3. Tela de Simulado com autosave de tentativa em andamento (substitui o
   `window.storage` do artifact por chamadas ao Supabase).
4. Tela de Resultado + Histórico.
5. Plano de Estudos (CRUD simples de itens por disciplina/data).
6. Revisão de Erros com o sistema Leitner.
7. Dashboard inicial juntando: contagem de dias até a prova, % médio das últimas
   tentativas, quantos cards de revisão estão vencidos hoje.

## 10. O que não fazer

- Não usar `localStorage`/`sessionStorage` como fonte de verdade — o requisito
  explícito é sincronizar entre celular e PC via Supabase.
- Não reescrever o enunciado/gabarito/explicação das 100 questões existentes; são
  conteúdo fixo da prova e qualquer divergência pode mudar o resultado do simulado.
- Não remover a Row Level Security "para simplificar" — mesmo sendo uso pessoal, o
  app fica em domínio público.