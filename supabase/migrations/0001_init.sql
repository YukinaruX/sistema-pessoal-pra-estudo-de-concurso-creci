-- =============================================================
-- Sistema de Estudos CRECI-BA — schema inicial
-- Postgres / Supabase
-- =============================================================

-- ---------- conteúdo da prova (leitura pública) ----------

create table if not exists simulados (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  banca text,
  total_questoes int,
  created_at timestamptz default now()
);

create table if not exists questoes (
  id serial primary key,
  simulado_id uuid references simulados(id) on delete cascade,
  disciplina text not null,
  assunto text not null,
  enunciado text not null,
  gabarito text not null check (gabarito in ('C','E')),
  explicacao text not null,
  ordem int
);

create index if not exists idx_questoes_simulado on questoes(simulado_id);

-- ---------- tentativas de prova (dados do usuário) ----------

create table if not exists tentativas (
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

create index if not exists idx_tentativas_user on tentativas(user_id);

create table if not exists respostas (
  id uuid primary key default gen_random_uuid(),
  tentativa_id uuid references tentativas(id) on delete cascade not null,
  questao_id int references questoes(id) not null,
  resposta text check (resposta in ('C','E')),
  correta boolean,
  respondido_em timestamptz default now(),
  unique (tentativa_id, questao_id)
);

create index if not exists idx_respostas_tentativa on respostas(tentativa_id);

-- ---------- plano de estudos ----------

create table if not exists planos_estudo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  titulo text not null,
  data_prova date,
  created_at timestamptz default now()
);

create index if not exists idx_planos_user on planos_estudo(user_id);

create table if not exists plano_itens (
  id uuid primary key default gen_random_uuid(),
  plano_id uuid references planos_estudo(id) on delete cascade not null,
  disciplina text not null,
  assunto text,
  data_planejada date,
  status text default 'pendente' check (status in ('pendente','em_andamento','concluido')),
  observacoes text,
  ordem int
);

create index if not exists idx_plano_itens_plano on plano_itens(plano_id);

-- ---------- revisão de erros (Leitner: 5 caixas) ----------

create table if not exists revisao_cards (
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

create index if not exists idx_revisao_user on revisao_cards(user_id);

-- =============================================================
-- Row Level Security
-- =============================================================

-- Conteúdo da prova: leitura pública, escrita só service role.
alter table simulados enable row level security;
alter table questoes  enable row level security;

drop policy if exists "leitura publica de simulados" on simulados;
create policy "leitura publica de simulados" on simulados
  for select using (true);

drop policy if exists "leitura publica de questoes" on questoes;
create policy "leitura publica de questoes" on questoes
  for select using (true);

-- Dados pessoais: cada usuário só enxerga/edita o que é seu.
alter table tentativas    enable row level security;
alter table respostas     enable row level security;
alter table planos_estudo enable row level security;
alter table plano_itens   enable row level security;
alter table revisao_cards enable row level security;

drop policy if exists "usuario ve suas tentativas" on tentativas;
create policy "usuario ve suas tentativas" on tentativas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- respostas pertencem a uma tentativa do usuário (join via tentativa_id)
drop policy if exists "usuario ve suas respostas" on respostas;
create policy "usuario ve suas respostas" on respostas
  for all using (
    exists (
      select 1 from tentativas t
      where t.id = respostas.tentativa_id and t.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from tentativas t
      where t.id = respostas.tentativa_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "usuario ve seus planos" on planos_estudo;
create policy "usuario ve seus planos" on planos_estudo
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "usuario ve seus itens de plano" on plano_itens;
create policy "usuario ve seus itens de plano" on plano_itens
  for all using (
    exists (
      select 1 from planos_estudo p
      where p.id = plano_itens.plano_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from planos_estudo p
      where p.id = plano_itens.plano_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "usuario ve seus cards de revisao" on revisao_cards;
create policy "usuario ve seus cards de revisao" on revisao_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
