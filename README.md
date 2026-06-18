# Estudos CRECI-BA

Sistema pessoal de estudos para o concurso do **CRECI-BA** (banca Quadrix, 100
questões certo/errado). Simulados com cronômetro e autosave, histórico de
desempenho, plano de estudos e revisão de erros por repetição espaçada (Leitner,
5 caixas). Frontend Vite + React falando direto com o **Supabase** (Postgres +
Auth + RLS).

> Detalhes de arquitetura, banco e convenções estão em [`AGENTS.md`](./AGENTS.md).

## 1. Pré-requisitos

- Node 18+ e npm.
- Um projeto no [Supabase](https://supabase.com) (free tier serve).

## 2. Configurar o Supabase

1. No painel do Supabase, vá em **SQL Editor** e rode, nesta ordem:
   - `supabase/migrations/0001_init.sql` — cria tabelas, RLS e policies.
   - `supabase/seed.sql` — popula o simulado e as **110 questões** (Português,
     Matemática, Noções de Informática, Conhecimentos Específicos, Legislação e
     Ética). A fonte das questões fica em `src/data/seedQuestoes.js`.
2. Em **Project Settings → API**, copie a `URL` e a `anon public key`.
3. Crie um arquivo `.env` na raiz (baseado em `.env.example`):
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
   Nunca commite o `.env` real. A `anon key` é segura no frontend porque a RLS
   isola os dados de cada usuário — **não** use a service role key aqui.

## 3. Rodar localmente

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # gera dist/ para deploy
npm run preview   # testa o build localmente
npm run lint
```

Crie uma conta na tela de login (Supabase Auth, e-mail + senha). Se a confirmação
de e-mail estiver ligada no Supabase, confirme pelo link antes do primeiro login —
ou desative em **Authentication → Providers → Email**.

## 4. Deploy (Netlify ou Vercel)

Build estático do Vite (`dist/`). Os arquivos `netlify.toml` e `vercel.json` já
trazem o redirect de SPA para `index.html` (obrigatório para as rotas client-side
não darem 404 ao recarregar). Configure `VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY` nas variáveis de ambiente do painel da plataforma.

## 5. Estrutura

```
src/
  pages/          Login, Dashboard, Simulado, ResultadoTentativa, Historico, PlanoEstudos, Revisao
  components/     shared/ (Layout, Navbar, Loading, ProtectedRoute), simulado/, revisao/
  hooks/          useAuth, AuthProvider, useTentativaAtiva
  lib/            supabaseClient, leitner (repetição espaçada), estatisticas, mappers
  data/           seedQuestoes.js
  styles/         theme.js  (tokens) + index.css (design system)
supabase/
  migrations/0001_init.sql
  seed.sql
```
