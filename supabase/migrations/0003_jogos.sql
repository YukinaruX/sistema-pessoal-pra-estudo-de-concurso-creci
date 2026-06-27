-- =============================================================
-- Jogos de estudo CRECI-BA — tabelas + seed
-- =============================================================

create table if not exists jogo_questoes (
  id         uuid primary key default gen_random_uuid(),
  disciplina text    not null,
  pergunta   text    not null,
  opcoes     jsonb,
  resposta   text    not null,
  tipo       text    not null default 'mc',
  nivel      text    not null default 'medio',
  created_at timestamptz default now()
);

create table if not exists jogo_pares (
  id         uuid primary key default gen_random_uuid(),
  disciplina text not null,
  termo      text not null,
  definicao  text not null,
  created_at timestamptz default now()
);

create table if not exists jogo_recordes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  jogo       text    not null,
  pontuacao  integer not null,
  disciplina text,
  created_at timestamptz default now()
);

create index if not exists idx_jogo_recordes_user on jogo_recordes(user_id, jogo);

alter table jogo_questoes enable row level security;
alter table jogo_pares    enable row level security;
alter table jogo_recordes enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'jogo_questoes' and policyname = 'leitura_publica_questoes') then
    create policy "leitura_publica_questoes" on jogo_questoes for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'jogo_pares' and policyname = 'leitura_publica_pares') then
    create policy "leitura_publica_pares" on jogo_pares for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'jogo_recordes' and policyname = 'proprio_recorde') then
    create policy "proprio_recorde" on jogo_recordes for all using (auth.uid() = user_id);
  end if;
end $$;

-- =============================================================
-- Seed de questões adaptadas da prova CRECI-RO (Assistente Administrativo)
-- Instituto Quadrix, aplicação 2022 — gabarito preliminar oficial
-- Formato: Verdadeiro/Falso (tipo = 'vf')
-- C (Certo) -> 'true' | E (Errado) -> 'false'
--
-- disciplina usa EXATAMENTE os valores do filtro do app:
--   'Português' | 'Matemática' | 'Noções de Informática' | 'Legislação e Ética' | 'Conhecimentos Específicos'
-- =============================================================

-- ---------- PORTUGUÊS ----------

insert into jogo_questoes (disciplina, pergunta, resposta, tipo, nivel) values
('Português', 'Um texto dissertativo-informativo pode apresentar percentuais e dados estatísticos como recurso de comprovação de suas afirmações.', 'true', 'vf', 'facil'),
('Português', 'Na frase "ficou mais fácil adquirir imóveis", o termo "fácil" classifica-se como advérbio.', 'false', 'vf', 'medio'),
('Português', 'As palavras "área", "saúde" e "imobiliário" não seguem a mesma regra de acentuação gráfica entre si.', 'true', 'vf', 'dificil'),
('Português', 'A concordância verbal em terceira pessoa do plural deve ser feita com o núcleo do sujeito da oração, mesmo quando há outros termos próximos no plural.', 'true', 'vf', 'medio'),
('Português', 'O acento indicativo de crase é utilizado antes de palavras femininas regidas por verbo ou termo que exija a preposição "a", combinada com o artigo feminino "a(s)".', 'true', 'vf', 'medio'),
('Português', 'Em uma redação formal, substituir um ponto final por dois-pontos pode alterar a coerência do texto se a relação entre as ideias não for de explicação ou enumeração.', 'true', 'vf', 'medio'),
('Português', 'A correspondência oficial admite o uso da expressão "Vossa Excelentíssima" como forma de tratamento, mesmo sendo gramaticalmente inadequada nesse contexto.', 'false', 'vf', 'dificil'),
('Português', 'Na linguagem de correspondência oficial, frases como "visto a facilidade e agilidade decorrentes" estão em conformidade plena com a norma-padrão.', 'false', 'vf', 'dificil'),
('Português', 'A coesão textual pode ser comprometida quando uma palavra é substituída por outra com sentido ou regência diferente do original.', 'true', 'vf', 'medio'),
('Português', 'Reescrever um período usando "embora" no lugar de "mas" pode manter a coerência textual, desde que a relação de oposição entre as ideias seja preservada.', 'true', 'vf', 'medio');

-- ---------- MATEMÁTICA ----------

insert into jogo_questoes (disciplina, pergunta, resposta, tipo, nivel) values
('Matemática', 'O número de anagramas de uma palavra com letras repetidas é sempre igual ao fatorial do número total de letras, sem necessidade de dividir pelas repetições.', 'false', 'vf', 'medio'),
('Matemática', 'Para calcular quantos anagramas de uma palavra começam e terminam com letras específicas, deve-se fixar essas posições e permutar as letras restantes.', 'true', 'vf', 'medio'),
('Matemática', 'O resto de uma divisão entre o total de anagramas de uma palavra e um número qualquer pode ser obtido aplicando a definição de divisão euclidiana (resto sempre menor que o divisor).', 'true', 'vf', 'medio'),
('Matemática', 'Para contar anagramas em que certas letras (como consoantes) devem ficar juntas, agrupa-se esse conjunto como um único "bloco" e multiplica-se pelas permutações internas do bloco.', 'true', 'vf', 'medio'),
('Matemática', 'A velocidade média de um percurso é calculada dividindo a distância total pelo tempo total gasto, expresso na mesma unidade de medida.', 'true', 'vf', 'facil'),
('Matemática', 'Se dois veículos percorrem a mesma distância em sentidos opostos, partindo ao mesmo tempo, o tempo até o encontro pode ser calculado pela razão entre a distância total e a soma das velocidades.', 'true', 'vf', 'medio'),
('Matemática', 'A razão entre dois tempos de percurso distintos é obtida dividindo o maior tempo pelo menor tempo, resultando sempre em um valor maior que 1.', 'false', 'vf', 'dificil'),
('Matemática', 'Na lógica proposicional, uma condicional "Se P, então Q" é falsa apenas quando P é verdadeiro e Q é falso.', 'true', 'vf', 'medio'),
('Matemática', 'Se a proposição "Se P, então (Q ou R)" é falsa, então necessariamente P é verdadeiro e tanto Q quanto R são falsos.', 'true', 'vf', 'dificil'),
('Matemática', 'A negação de uma proposição condicional verdadeira sempre resulta em uma proposição também verdadeira.', 'false', 'vf', 'dificil');

-- ---------- NOÇÕES DE INFORMÁTICA ----------

insert into jogo_questoes (disciplina, pergunta, resposta, tipo, nivel) values
('Noções de Informática', 'O software comanda o funcionamento do hardware, pois é definido como um conjunto de instruções produzidas a partir de linguagem de programação que indica o processamento a ser realizado.', 'true', 'vf', 'facil'),
('Noções de Informática', 'Conceitualmente, não há diferença entre software livre e software gratuito, já que ambos disponibilizam seu código-fonte ao público.', 'false', 'vf', 'medio'),
('Noções de Informática', 'O BitLocker é um recurso do Windows que tem a função de criptografar/descriptografar o conteúdo do disco rígido do computador.', 'true', 'vf', 'facil'),
('Noções de Informática', 'No Excel, o procedimento de mesclar células é irreversível, ou seja, uma vez realizado não é possível desfazê-lo.', 'false', 'vf', 'medio'),
('Noções de Informática', 'O Telnet é o protocolo responsável pelo controle de envio e recebimento de e-mails.', 'false', 'vf', 'medio'),
('Noções de Informática', 'A tecnologia Wi-Fi é utilizada tanto em ambientes domésticos quanto empresariais, não havendo restrição técnica que impeça seu uso corporativo.', 'true', 'vf', 'facil'),
('Noções de Informática', 'O mecanismo de busca por imagem do Google exige que a imagem tenha resolução menor ou igual a 200 dpi para funcionar.', 'false', 'vf', 'medio'),
('Noções de Informática', 'O Google permite excluir mais de uma palavra dos resultados de busca, utilizando o operador de exclusão antes de cada termo.', 'true', 'vf', 'facil'),
('Noções de Informática', 'É importante orientar periodicamente os colaboradores de empresas e órgãos públicos sobre cuidados com a informação, pois falhas humanas podem comprometer a segurança dos sistemas.', 'true', 'vf', 'facil'),
('Noções de Informática', 'Um clique simples, por padrão, refere-se a um clique realizado com o botão esquerdo do mouse, em configuração-padrão para destros.', 'true', 'vf', 'facil');

-- ---------- LEGISLAÇÃO E ÉTICA ----------

insert into jogo_questoes (disciplina, pergunta, resposta, tipo, nivel) values
('Legislação e Ética', 'O sistema de responsabilização por atos de improbidade administrativa tutela a probidade na organização do Estado e no exercício de suas funções, assegurando a integridade do patrimônio público e social.', 'true', 'vf', 'medio'),
('Legislação e Ética', 'O mero exercício da função ou o desempenho de competências públicas, sem comprovação de ato doloso com fim ilícito, afasta a responsabilidade por ato de improbidade administrativa.', 'true', 'vf', 'medio'),
('Legislação e Ética', 'Os atos de improbidade violam a probidade e a integridade do patrimônio público apenas quando praticados pelos Poderes Executivo e Legislativo.', 'false', 'vf', 'medio'),
('Legislação e Ética', 'Não configura improbidade a ação ou omissão decorrente de divergência interpretativa da lei, baseada em jurisprudência ainda não pacificada, mesmo que não venha a prevalecer nas decisões dos órgãos de controle ou tribunais.', 'true', 'vf', 'dificil'),
('Legislação e Ética', 'O sucessor ou herdeiro de quem causou dano ao erário ou enriqueceu ilicitamente está sujeito a todas as sanções da Lei de Improbidade, e não apenas à reparação do dano.', 'false', 'vf', 'medio'),
('Legislação e Ética', 'O agente público pode, antes de tomar posse, deixar de apresentar declaração de bens, desde que assuma o risco de responder objetivamente por eventual ato de improbidade.', 'false', 'vf', 'dificil'),
('Legislação e Ética', 'Apenas delegados de Polícia e membros do Poder Judiciário podem representar à autoridade administrativa para apurar prática de ato de improbidade.', 'false', 'vf', 'medio'),
('Legislação e Ética', 'É vedada a formulação de pedido de indisponibilidade de bens, em ação judicial, por ato de improbidade administrativa.', 'false', 'vf', 'medio'),
('Legislação e Ética', 'É facultado ao Ministério Público celebrar acordo de não persecução cível dispensando o integral ressarcimento do dano ao erário.', 'false', 'vf', 'dificil'),
('Legislação e Ética', 'Constitui crime a representação por ato de improbidade contra agente público ou terceiro beneficiário quando o autor da denúncia sabe que o acusado é inocente.', 'true', 'vf', 'medio'),
('Legislação e Ética', 'É impedido de atuar em processo administrativo o servidor ou autoridade que esteja litigando, judicial ou administrativamente, com o interessado ou seu cônjuge/companheiro.', 'true', 'vf', 'medio'),
('Legislação e Ética', 'Os atos do processo administrativo não dependem de forma determinada, salvo quando a lei expressamente a exigir.', 'true', 'vf', 'facil'),
('Legislação e Ética', 'Todas as firmas existentes em processo administrativo devem ser reconhecidas por autoridade notarial, sob pena de nulidade.', 'false', 'vf', 'medio'),
('Legislação e Ética', 'São inadmissíveis no processo administrativo as provas obtidas por meios ilícitos.', 'true', 'vf', 'facil'),
('Legislação e Ética', 'O interessado pode, a qualquer tempo e independentemente da fase do processo, juntar documentos e pareceres ou requerer diligências e perícias.', 'true', 'vf', 'medio');

-- ---------- CONHECIMENTOS ESPECÍFICOS ----------

insert into jogo_questoes (disciplina, pergunta, resposta, tipo, nivel) values
-- Gestão de Pessoas
('Conhecimentos Específicos', 'A área de gestão de pessoas envolve políticas e práticas relacionadas a recrutamento, seleção, treinamento, recompensas e avaliação de desempenho.', 'true', 'vf', 'facil'),
('Conhecimentos Específicos', 'A globalização e a competitividade, aliadas ao acesso veloz à informação, exigiram que as empresas se adaptassem.', 'true', 'vf', 'facil'),
('Conhecimentos Específicos', 'Administrar e impulsionar a mudança dentro da empresa é um dos objetivos da área de gestão de pessoas.', 'true', 'vf', 'facil'),
('Conhecimentos Específicos', 'A área de gestão de pessoas não é um fim em si mesma, mas um meio de alcançar a eficácia e eficiência das pessoas.', 'true', 'vf', 'medio'),
('Conhecimentos Específicos', 'Os objetivos básicos da gestão de pessoas são: pessoal, societário, administrativo e organizacional.', 'false', 'vf', 'dificil'),
('Conhecimentos Específicos', 'A gestão de pessoas seleciona, desenvolve, remunera e mantém equipes comprometidas com as estratégias e metas da empresa.', 'true', 'vf', 'facil'),
('Conhecimentos Específicos', 'O comportamento organizacional investiga o impacto que indivíduos, grupos e estrutura têm sobre o comportamento dentro das organizações.', 'true', 'vf', 'facil'),
('Conhecimentos Específicos', 'O comportamento organizacional contribui para a gestão de pessoas, mas não fornece insumos para o trabalho dos líderes.', 'false', 'vf', 'medio'),
('Conhecimentos Específicos', 'O estudo do comportamento organizacional é uma ciência aplicada que independe da contribuição de outras disciplinas comportamentais.', 'false', 'vf', 'medio'),
('Conhecimentos Específicos', 'O comportamento organizacional descreve o que fazem os executivos e explica a importância de seu estudo sistemático.', 'true', 'vf', 'medio'),
('Conhecimentos Específicos', 'Somente fatores internos, como personalidade, aprendizagem, percepção, cognição e motivação, exercem influência no comportamento organizacional.', 'false', 'vf', 'medio'),
('Conhecimentos Específicos', 'O indivíduo precisa atingir os objetivos organizacionais (ser eficaz) e satisfazer suas necessidades individuais (ser eficiente) para sobreviver dentro do sistema.', 'true', 'vf', 'dificil'),
('Conhecimentos Específicos', 'O contrato formal é o acordo entre indivíduo e organização quanto ao cargo, conteúdo do trabalho, horários e salário.', 'true', 'vf', 'facil'),
('Conhecimentos Específicos', 'A eficácia, na participação das pessoas na organização, representa o alcance dos objetivos individuais, como promoção e prestígio.', 'false', 'vf', 'dificil'),
('Conhecimentos Específicos', 'No processo de reciprocidade, a organização concede incentivos e recompensas enquanto as pessoas oferecem trabalho esperando satisfações pessoais.', 'true', 'vf', 'medio'),
('Conhecimentos Específicos', 'O equilíbrio organizacional ocorre quando as contribuições dos colaboradores são compatíveis, em quantidade e qualidade, com as recompensas ofertadas.', 'true', 'vf', 'medio'),
('Conhecimentos Específicos', 'Contribuições são pagamentos feitos pela organização aos participantes, como salários, prêmios e benefícios sociais.', 'false', 'vf', 'medio'),
('Conhecimentos Específicos', 'A liderança emerge da necessidade de liderança de um grupo e está ligada à conjuntura social, econômica e política em que o grupo se apresenta.', 'true', 'vf', 'medio'),
('Conhecimentos Específicos', 'O gerente representa a autoridade formal, sendo produto de um único fator: o cargo ocupado.', 'false', 'vf', 'dificil'),
('Conhecimentos Específicos', 'A motivação não é cíclica e começa com uma necessidade, definida como força dinâmica que interrompe o equilíbrio do organismo.', 'false', 'vf', 'dificil'),
-- Atendimento ao Público
('Conhecimentos Específicos', 'A qualidade do atendimento está diretamente relacionada com a resposta que será dada ao cidadão.', 'true', 'vf', 'facil'),
('Conhecimentos Específicos', 'A qualidade no atendimento exige conhecimento técnico e administrativo, além de reconhecimento pessoal de como realizar a ação.', 'true', 'vf', 'facil'),
('Conhecimentos Específicos', 'Para ter qualidade no atendimento, não é necessário conhecer as normas da empresa nem o fluxo de informação e logística.', 'false', 'vf', 'facil'),
('Conhecimentos Específicos', 'A tangibilidade, relacionada às aparências das instalações físicas, não influencia a percepção de qualidade no atendimento.', 'false', 'vf', 'medio'),
('Conhecimentos Específicos', 'Deve-se estabelecer um limite entre o que é certo e errado, e entre o que o cliente quer e o que se deve fazer.', 'true', 'vf', 'medio'),
('Conhecimentos Específicos', 'Não cabe ao profissional de atendimento pensar de forma holística na definição de suas tarefas.', 'false', 'vf', 'medio'),
('Conhecimentos Específicos', 'O tempo de fila ou de espera não influencia a percepção de qualidade do atendimento.', 'false', 'vf', 'facil'),
('Conhecimentos Específicos', 'São características de qualidade de serviços: tangibilidade, confiabilidade, competência, cortesia, credibilidade, segurança, acesso, comunicação e entendimento do cliente (não inclui "proatividade").', 'false', 'vf', 'dificil'),
('Conhecimentos Específicos', 'Empresas que buscam qualidade no atendimento direcionam o olhar interno e externo para cortesia, benefícios e canais de comunicação interativos e ágeis.', 'true', 'vf', 'medio'),
('Conhecimentos Específicos', 'Não é muito importante resolver o problema do cliente, mas é imprescindível ouvi-lo para lhe passar segurança.', 'false', 'vf', 'facil'),
-- Arquivologia
('Conhecimentos Específicos', 'O valor administrativo do documento, referente ao funcionamento da instituição, é permanente e não se altera com o tempo.', 'false', 'vf', 'medio'),
('Conhecimentos Específicos', 'Os documentos permanentes não podem ser descartados em nenhuma hipótese, pois são imprescritíveis e inalienáveis.', 'false', 'vf', 'medio'),
('Conhecimentos Específicos', 'A classificação confidencial é dada a assuntos que não devem ser do conhecimento do público em geral.', 'true', 'vf', 'facil'),
('Conhecimentos Específicos', 'A classificação confidencial se aplica a assuntos que, embora não exijam alto grau de segurança, podem prejudicar indivíduo ou criar embaraços administrativos se conhecidos por pessoa não autorizada.', 'true', 'vf', 'medio'),
('Conhecimentos Específicos', 'A gestão documental é o ramo do arquivo responsável somente pela administração de documentos na fase corrente.', 'false', 'vf', 'medio'),
('Conhecimentos Específicos', 'A gestão documental, eletrônica ou em papel, está presente em todas as organizações.', 'false', 'vf', 'medio'),
('Conhecimentos Específicos', 'O tipo documental vai além da questão física, revela o conteúdo e sua estruturação, sendo resultado da ação representada.', 'true', 'vf', 'dificil'),
('Conhecimentos Específicos', 'A centralização rígida é aconselhável em qualquer cenário, inclusive em instituição de âmbito nacional.', 'false', 'vf', 'medio'),
('Conhecimentos Específicos', 'A fase corrente é composta pelos arquivos setoriais e pelo arquivo central (geral), localizado próximo aos setores.', 'false', 'vf', 'dificil'),
('Conhecimentos Específicos', 'Documentos oficiais sigilosos devem ser sempre abertos e analisados como os ostensivos.', 'false', 'vf', 'medio'),
('Conhecimentos Específicos', 'O órgão colegiado que define a política nacional de arquivos públicos e privados é o Arquivo Nacional.', 'false', 'vf', 'dificil'),
('Conhecimentos Específicos', 'Subvencionar a elaboração de planos nacionais de desenvolvimento de arquivos públicos e privados é competência do CONARQ.', 'true', 'vf', 'medio'),
('Conhecimentos Específicos', 'Entre as competências da Comissão Permanente de Avaliação de Documentos figuram a elaboração dos códigos de classificação, da tabela de temporalidade e a destinação final dos documentos.', 'false', 'vf', 'dificil'),
('Conhecimentos Específicos', 'Os servidores que participam da Comissão Permanente de Avaliação de Documentos recebem remuneração extra pelo trabalho desenvolvido.', 'false', 'vf', 'medio'),
('Conhecimentos Específicos', 'O documento submetido à Comissão Permanente de Avaliação de Documentos para liberar a eliminação de conjuntos documentais é denominado "listagem de eliminação de documentos".', 'true', 'vf', 'medio'),
('Conhecimentos Específicos', 'Documentos digitais devem ser codificados conforme o código de classificação, mesmo que sua eliminação não siga os mesmos termos dos documentos físicos.', 'true', 'vf', 'dificil'),
('Conhecimentos Específicos', 'Documentos originais em papel podem ser eliminados após digitalização, exceto os que tenham valor histórico.', 'true', 'vf', 'medio'),
('Conhecimentos Específicos', 'Em um sistema de gerenciamento de documentos, é possível fazer a gestão documental de processos híbridos.', 'true', 'vf', 'facil'),
('Conhecimentos Específicos', 'Documentos digitalizados devem representar com fidelidade os originais, exigindo controle de qualidade no processamento técnico de captura.', 'true', 'vf', 'facil'),
('Conhecimentos Específicos', 'Conjuntos documentais não listados na tabela de temporalidade nunca podem ser eliminados, mesmo com autorização excepcional da comissão.', 'false', 'vf', 'dificil');

-- =============================================================
-- Fim do seed (75 questões adaptadas do CRECI-RO, gabarito oficial Quadrix)
-- Distribuição: Português (10) | Matemática (10) | Noções de Informática (10)
--               Legislação e Ética (15) | Conhecimentos Específicos (50)
-- =============================================================