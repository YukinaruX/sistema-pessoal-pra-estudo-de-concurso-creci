-- Armazena a seleção e ordem de questões de cada tentativa.
-- Permite embaralhar e limitar questões por simulado, com persistência para retomar de onde parou.
alter table tentativas add column if not exists questoes_ids integer[];
