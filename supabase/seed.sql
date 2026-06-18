-- Seed de questões do Simulado CRECI-BA (banca Quadrix, nível médio)
-- Gerado automaticamente a partir da base de 110 questões (100 originais + 10 novas
-- cobrindo Controle e Organização de Documentos e Legislação Específica).
-- Use "on conflict do nothing" para poder rodar este script mais de uma vez sem duplicar.

insert into simulados (id, titulo, banca, total_questoes)
values ('11111111-1111-1111-1111-111111111111', 'Simulado CRECI-BA — Assistente Administrativo (Quadrix)', 'Quadrix', 110)
on conflict (id) do nothing;

insert into questoes (simulado_id, disciplina, assunto, enunciado, gabarito, explicacao, ordem)
values
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Interpretação de Texto$$, $$Leia o texto a seguir e julgue o item.

"A comunicação eficaz no ambiente administrativo pressupõe clareza, objetividade e adequação ao contexto. Um documento mal redigido pode gerar retrabalho, conflitos e até prejuízos institucionais. Por isso, o servidor público deve dominar as normas da língua culta e adaptar sua linguagem ao perfil do destinatário."

O texto afirma que a má redação de documentos pode causar impactos negativos na instituição pública.$$, 'C', $$O texto menciona explicitamente 'retrabalho, conflitos e até prejuízos institucionais' como consequências de um documento mal redigido.$$, 1),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Interpretação de Texto$$, $$Leia o texto a seguir e julgue o item.

"A comunicação eficaz no ambiente administrativo pressupõe clareza, objetividade e adequação ao contexto. Um documento mal redigido pode gerar retrabalho, conflitos e até prejuízos institucionais. Por isso, o servidor público deve dominar as normas da língua culta e adaptar sua linguagem ao perfil do destinatário."

De acordo com o texto, o servidor público deve utilizar sempre linguagem técnica e formal, independentemente do destinatário.$$, 'E', $$O texto diz que o servidor deve 'adaptar sua linguagem ao perfil do destinatário', o que contradiz a ideia de usar sempre linguagem técnica e formal.$$, 2),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Interpretação de Texto$$, $$Leia o texto a seguir e julgue o item.

"O mercado imobiliário brasileiro passa por um momento de transformação. A tecnologia tem permitido que corretores ampliem seu alcance por meio de plataformas digitais, reduzindo custos operacionais e acelerando negociações. O CRECI tem papel fundamental na regulação e fiscalização dessas práticas, garantindo segurança jurídica às transações."

Segundo o texto, a tecnologia contribuiu para aumentar os custos operacionais dos corretores de imóveis.$$, 'E', $$O texto afirma que a tecnologia permite 'reduzindo custos operacionais', ou seja, os custos diminuem, não aumentam.$$, 3),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Interpretação de Texto$$, $$Leia o texto a seguir e julgue o item.

"O mercado imobiliário brasileiro passa por um momento de transformação. A tecnologia tem permitido que corretores ampliem seu alcance por meio de plataformas digitais, reduzindo custos operacionais e acelerando negociações. O CRECI tem papel fundamental na regulação e fiscalização dessas práticas, garantindo segurança jurídica às transações."

Infere-se do texto que o CRECI exerce função regulatória sobre as atividades dos corretores de imóveis.$$, 'C', $$O texto menciona explicitamente que o CRECI tem 'papel fundamental na regulação e fiscalização dessas práticas'.$$, 4),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Interpretação de Texto$$, $$Leia o texto a seguir e julgue o item.

"A ética profissional não é um conjunto de regras impostas de fora, mas uma disposição interior que orienta o agir humano para o bem coletivo. No serviço público, ela se manifesta no respeito ao cidadão, na transparência das ações e no uso correto dos recursos públicos."

O texto apresenta a ética profissional como algo externo ao indivíduo, imposto por normas e regulamentos.$$, 'E', $$O texto afirma exatamente o contrário: a ética 'não é um conjunto de regras impostas de fora, mas uma disposição interior'.$$, 5),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Interpretação de Texto$$, $$Leia o texto a seguir e julgue o item.

"A ética profissional não é um conjunto de regras impostas de fora, mas uma disposição interior que orienta o agir humano para o bem coletivo. No serviço público, ela se manifesta no respeito ao cidadão, na transparência das ações e no uso correto dos recursos públicos."

O uso correto dos recursos públicos é citado no texto como uma das formas de manifestação da ética no serviço público.$$, 'C', $$O texto lista 'o uso correto dos recursos públicos' como uma das manifestações da ética profissional no serviço público.$$, 6),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Interpretação de Texto$$, $$Julgue o item a seguir.

Em um texto argumentativo, o parágrafo de introdução tem como função principal apresentar a tese que será desenvolvida e defendida ao longo do texto.$$, 'C', $$No texto dissertativo-argumentativo, a introdução apresenta o tema e a tese (posição do autor), que será desenvolvida nos parágrafos centrais.$$, 7),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Interpretação de Texto$$, $$Julgue o item a seguir.

A coesão textual refere-se à coerência lógica das ideias apresentadas no texto, enquanto a coerência diz respeito aos mecanismos linguísticos de ligação entre os elementos do texto.$$, 'E', $$Os conceitos estão invertidos: coesão são os mecanismos linguísticos de ligação (conectivos, pronomes, etc.) e coerência é a lógica e unidade de sentido do texto.$$, 8),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Análise Linguística e Semântica$$, $$Julgue o item a seguir sobre semântica.

As palavras "ceder" e "sede" são exemplos de parônimos, pois possuem grafia e pronúncia muito semelhantes, mas significados distintos.$$, 'E', $$'Ceder' e 'sede' não são parônimos entre si. Parônimos são palavras semelhantes na forma e som, como 'comprimento' e 'cumprimento'. 'Ceder' e 'sede' têm formas muito distintas.$$, 9),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Análise Linguística e Semântica$$, $$Julgue o item a seguir sobre semântica.

Na frase "O servidor chegou cedo ao trabalho", a palavra "cedo" é um advérbio de tempo que modifica o verbo "chegou".$$, 'C', $$'Cedo' é advérbio de tempo e modifica o verbo 'chegou', indicando quando a ação ocorreu.$$, 10),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Análise Linguística e Semântica$$, $$Julgue o item a seguir.

As palavras "banco" (instituição financeira) e "banco" (assento) são exemplos de polissemia, pois trata-se de uma mesma palavra com múltiplos significados.$$, 'C', $$Polissemia é o fenômeno em que uma mesma palavra possui vários significados. 'Banco' é um exemplo clássico de palavra polissêmica.$$, 11),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Análise Linguística e Semântica$$, $$Julgue o item a seguir.

A expressão "quebrar o galho" é um exemplo de linguagem denotativa, pois descreve literalmente uma ação física.$$, 'E', $$'Quebrar o galho' é uma expressão idiomática (conotativa), com sentido figurado de resolver um problema ou prestar um favor, não o sentido literal de quebrar um galho de árvore.$$, 12),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Análise Linguística e Semântica$$, $$Julgue o item a seguir.

Sinônimos são palavras com significados opostos, enquanto antônimos são palavras com o mesmo significado.$$, 'E', $$Os conceitos estão invertidos: sinônimos têm significados semelhantes (ex: feliz/contente) e antônimos têm significados opostos (ex: feliz/triste).$$, 13),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Análise Linguística e Semântica$$, $$Julgue o item a seguir.

Na frase "Ela mal havia chegado quando o chefe a chamou", o vocábulo "mal" funciona como advérbio, indicando que a ação de chegar tinha ocorrido há pouco tempo.$$, 'C', $$Nesse contexto, 'mal' funciona como advérbio de tempo com sentido de 'assim que' ou 'logo que', indicando brevidade temporal entre as ações.$$, 14),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Estrutura Textual$$, $$Julgue o item a seguir sobre tipologia textual.

O texto narrativo caracteriza-se pela exposição e análise de conceitos, com o objetivo de informar ou explicar determinado fenômeno ao leitor.$$, 'E', $$O texto que expõe e analisa conceitos para informar ou explicar é o texto EXPOSITIVO (ou dissertativo-expositivo). O narrativo relata eventos com personagens, tempo, espaço e enredo.$$, 15),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Estrutura Textual$$, $$Julgue o item a seguir.

O ofício é um tipo de correspondência oficial utilizado para comunicação entre órgãos públicos ou entre estes e entidades privadas, sendo obrigatório o uso de linguagem formal e impessoal.$$, 'C', $$O ofício é correspondência oficial, usada para comunicação externa de órgãos públicos. Exige linguagem formal, objetiva e impessoal, conforme o Manual de Redação da Presidência da República.$$, 16),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Estrutura Textual$$, $$Julgue o item a seguir.

O memorando é uma correspondência interna, utilizada entre unidades administrativas de um mesmo órgão, dispensando formalidades excessivas e priorizando a objetividade.$$, 'C', $$O memorando (atualmente chamado de 'comunicação interna' no Manual de Redação da Presidência) é de uso interno, caracterizado pela agilidade e objetividade.$$, 17),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Estrutura Textual$$, $$Julgue o item a seguir.

Em um texto dissertativo-argumentativo, a conclusão deve apresentar novos argumentos ainda não discutidos, a fim de enriquecer a defesa da tese.$$, 'E', $$A conclusão retoma a tese e sintetiza os argumentos já desenvolvidos; ela não deve introduzir novos argumentos, mas sim consolidar o que foi discutido.$$, 18),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Sintaxe$$, $$Julgue o item a seguir.

Na oração "Os documentos foram protocolados pela secretaria", o sujeito é "os documentos" e o verbo está na voz passiva analítica.$$, 'C', $$Correto. 'Os documentos' é o sujeito paciente. A voz passiva analítica é formada por verbo auxiliar (foram) + particípio (protocolados) + agente da passiva (pela secretaria).$$, 19),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Sintaxe$$, $$Julgue o item a seguir.

Na frase "Precisa-se de funcionários qualificados", o pronome "se" funciona como partícula apassivadora, e "funcionários qualificados" é o sujeito da oração.$$, 'E', $$Nesse caso, 'se' é índice de indeterminação do sujeito (o sujeito é indeterminado), e 'funcionários qualificados' funciona como objeto direto preposicionado.$$, 20),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Sintaxe$$, $$Julgue o item a seguir.

A concordância verbal está correta na frase: "Fazem dois anos que ingressei no serviço público."$$, 'E', $$O verbo 'fazer' no sentido de tempo decorrido é impessoal e deve ficar no singular: 'Faz dois anos que ingressei no serviço público.'$$, 21),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Sintaxe$$, $$Julgue o item a seguir.

Na frase "Entre os candidatos aprovados, incluem-se servidores de diversas regiões", a concordância está correta, pois o sujeito "servidores de diversas regiões" está no plural.$$, 'C', $$Correto. Com o pronome 'se' apassivador, o verbo concorda com o sujeito 'servidores', que está no plural, justificando 'incluem-se'.$$, 22),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Pontuação$$, $$Julgue o item a seguir.

O uso da vírgula está correto na frase: "O diretor, aprovou o relatório, e encaminhou ao conselho."$$, 'E', $$Não se usa vírgula entre sujeito e predicado. A frase correta seria: 'O diretor aprovou o relatório e encaminhou ao conselho.' A vírgula após 'diretor' é incorreta.$$, 23),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Pontuação$$, $$Julgue o item a seguir.

O ponto e vírgula pode ser usado para separar orações coordenadas de certa extensão ou itens de uma enumeração complexa.$$, 'C', $$O ponto e vírgula tem exatamente essas funções: separar orações coordenadas mais longas e organizar enumerações com itens extensos ou que já contêm vírgulas internamente.$$, 24),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Pontuação$$, $$Julgue o item a seguir.

Os dois-pontos devem ser usados antes de uma enumeração, de uma citação ou de uma explicação, sendo incorreto seu uso antes de verbos.$$, 'E', $$Os dois-pontos podem sim ser usados antes de verbos quando introduzem uma explicação ou enumeração de ações: 'Sua função era simples: atender, registrar e encaminhar.'$$, 25),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Reescrita e Produção Textual$$, $$Julgue o item a seguir.

A frase "O problema foi solucionado pelos técnicos" pode ser reescrita na voz ativa como: "Os técnicos solucionaram o problema", sem alteração de sentido.$$, 'C', $$A conversão de voz passiva para ativa foi feita corretamente, mantendo o mesmo sentido: o agente da passiva 'pelos técnicos' torna-se sujeito e o sujeito paciente 'o problema' torna-se objeto direto.$$, 26),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Reescrita e Produção Textual$$, $$Julgue o item a seguir.

Ao substituir "Apesar de o servidor ter faltado, o trabalho foi concluído" por "Embora o servidor tivesse faltado, o trabalho foi concluído", ocorre alteração de sentido.$$, 'E', $$As conjunções 'apesar de' e 'embora' são ambas concessivas e expressam o mesmo sentido de contraste/oposição. A substituição não altera o sentido da frase.$$, 27),
  ('11111111-1111-1111-1111-111111111111', $$Português$$, $$Reescrita e Produção Textual$$, $$Julgue o item a seguir.

A substituição de "visto que" por "portanto" na frase "O prazo foi prorrogado, visto que os documentos não estavam completos" mantém o sentido original.$$, 'E', $$'Visto que' é conjunção causal (explica a causa). 'Portanto' é conjunção conclusiva. A troca altera completamente o sentido lógico da oração.$$, 28),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Matemática Básica$$, $$Julgue o item a seguir.

Se um servidor recebe salário de R$ 2.800,00 e tem um desconto de 11% de INSS, o valor líquido recebido é de R$ 2.492,00.$$, 'C', $$11% de R$ 2.800,00 = R$ 308,00. Valor líquido: R$ 2.800,00 - R$ 308,00 = R$ 2.492,00.$$, 29),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Matemática Básica$$, $$Julgue o item a seguir.

Um escritório de 120 m² tem 30% da área destinada à recepção. A área da recepção é de 42 m².$$, 'E', $$30% de 120 m² = 0,30 × 120 = 36 m², e não 42 m².$$, 30),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Matemática Básica$$, $$Julgue o item a seguir.

A razão entre 45 e 15 é igual ao produto entre 2 e 1,5.$$, 'C', $$Razão entre 45 e 15 = 45/15 = 3. Produto entre 2 e 1,5 = 2 × 1,5 = 3. Ambos resultam em 3, então a afirmativa é correta.$$, 31),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Matemática Básica$$, $$Julgue o item a seguir.

Se 5 funcionários realizam uma tarefa em 12 dias, então 3 funcionários realizarão a mesma tarefa em 20 dias, mantendo o mesmo ritmo de trabalho.$$, 'C', $$Grandezas inversamente proporcionais: 5 × 12 = 60. Para 3 funcionários: 60/3 = 20 dias. Correto.$$, 32),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Matemática Básica$$, $$Julgue o item a seguir.

O mínimo múltiplo comum (MMC) entre 12 e 18 é 36.$$, 'C', $$MMC(12,18): 12 = 2²×3; 18 = 2×3². MMC = 2²×3² = 4×9 = 36. Correto.$$, 33),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Matemática Básica$$, $$Julgue o item a seguir.

Um produto custava R$ 150,00 e sofreu aumento de 20%. Após o aumento, sofreu desconto de 20%. O preço final é igual ao preço original.$$, 'E', $$Após aumento de 20%: R$ 150,00 × 1,20 = R$ 180,00. Após desconto de 20%: R$ 180,00 × 0,80 = R$ 144,00. O preço final (R$ 144,00) é menor que o original (R$ 150,00).$$, 34),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Análise Combinatória e Probabilidade$$, $$Julgue o item a seguir.

O número de anagramas da palavra "MESA" é igual a 24.$$, 'C', $$A palavra MESA tem 4 letras distintas. O número de anagramas é 4! = 4×3×2×1 = 24. Correto.$$, 35),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Análise Combinatória e Probabilidade$$, $$Julgue o item a seguir.

Ao lançar um dado honesto, a probabilidade de obter um número par é de 1/3.$$, 'E', $$Um dado tem 6 faces. Números pares: 2, 4 e 6 (3 resultados). Probabilidade = 3/6 = 1/2, não 1/3.$$, 36),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Análise Combinatória e Probabilidade$$, $$Julgue o item a seguir.

O número de combinações de 6 elementos tomados 2 a 2 é igual a 15.$$, 'C', $$C(6,2) = 6!/(2!×4!) = (6×5)/(2×1) = 30/2 = 15. Correto.$$, 37),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Análise Combinatória e Probabilidade$$, $$Julgue o item a seguir.

Uma urna contém 4 bolas vermelhas e 6 bolas azuis. A probabilidade de retirar uma bola vermelha é de 2/5.$$, 'C', $$Total de bolas = 10. Probabilidade de vermelha = 4/10 = 2/5. Correto.$$, 38),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Análise Combinatória e Probabilidade$$, $$Julgue o item a seguir.

O número de permutações da palavra "ANA" é igual a 6.$$, 'E', $$A palavra ANA tem 3 letras com a letra 'A' repetida 2 vezes. Permutações com repetição = 3!/2! = 6/2 = 3, não 6.$$, 39),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Raciocínio Lógico$$, $$Julgue o item a seguir.

A negação da proposição "Todos os servidores são pontuais" é "Nenhum servidor é pontual".$$, 'E', $$A negação de 'Todos são P' é 'Existe pelo menos um que não é P' (= 'Algum servidor não é pontual'). 'Nenhum servidor é pontual' é uma proposição muito mais forte e não é a negação correta.$$, 40),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Raciocínio Lógico$$, $$Julgue o item a seguir.

Se a proposição "P → Q" é verdadeira e P é verdadeiro, então Q necessariamente é verdadeiro.$$, 'C', $$Pelo modus ponens: se 'P implica Q' é verdadeiro e P é verdadeiro, então Q é necessariamente verdadeiro.$$, 41),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Raciocínio Lógico$$, $$Julgue o item a seguir.

A conjunção "P ∧ Q" é verdadeira somente quando ambas as proposições P e Q são verdadeiras.$$, 'C', $$A conjunção (E) só é verdadeira quando os dois componentes são verdadeiros. Se qualquer um for falso, a conjunção é falsa.$$, 42),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Raciocínio Lógico$$, $$Julgue o item a seguir.

Na sequência 2, 5, 10, 17, 26, ..., o próximo termo é 37.$$, 'C', $$As diferenças entre termos são: 3, 5, 7, 9 (progressão aritmética com razão 2). O próximo acréscimo é 11, logo 26 + 11 = 37. Correto.$$, 43),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Raciocínio Lógico$$, $$Julgue o item a seguir.

A disjunção "P ∨ Q" é falsa somente quando ambas as proposições P e Q são falsas.$$, 'C', $$A disjunção (OU) é falsa apenas quando os dois componentes são falsos. Basta um ser verdadeiro para a disjunção ser verdadeira.$$, 44),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Raciocínio Analítico e Espacial$$, $$Julgue o item a seguir.

Em uma sala com 5 pessoas (Ana, Bruno, Carlos, Diana e Eduardo), Ana senta à direita de Bruno, Carlos senta entre Diana e Eduardo, e Bruno senta à esquerda de Diana. Com base nessas informações, Eduardo está na extremidade direita da fila.$$, 'C', $$Com as restrições dadas, uma ordenação possível é: Bruno, Ana, Diana, Carlos, Eduardo. Eduardo está na extremidade direita.$$, 45),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Raciocínio Analítico e Espacial$$, $$Julgue o item a seguir.

Um cubo possui 12 arestas, 8 vértices e 6 faces.$$, 'C', $$Um cubo tem exatamente 6 faces, 12 arestas e 8 vértices. Pela fórmula de Euler: V - A + F = 8 - 12 + 6 = 2. Correto.$$, 46),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Raciocínio Analítico e Espacial$$, $$Julgue o item a seguir.

Se todos os A são B, e alguns B são C, pode-se concluir que alguns A são C.$$, 'E', $$Não é possível concluir isso. Os 'alguns B que são C' podem ser exatamente os B que não são A. Portanto, a conclusão não é necessariamente verdadeira.$$, 47),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Análise de Dados$$, $$Julgue o item a seguir.

A mediana de um conjunto de dados é o valor que divide o conjunto em duas partes iguais, após os dados estarem ordenados.$$, 'C', $$Correto. A mediana é o valor central de um conjunto ordenado, dividindo-o ao meio.$$, 48),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Análise de Dados$$, $$Julgue o item a seguir.

A média aritmética dos valores 4, 8, 6, 10 e 12 é igual a 9.$$, 'E', $$Soma: 4+8+6+10+12 = 40. Média = 40/5 = 8, não 9.$$, 49),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Análise de Dados$$, $$Julgue o item a seguir.

A moda de um conjunto de dados é o valor que ocorre com maior frequência. Um conjunto pode ter mais de uma moda.$$, 'C', $$Correto. Quando dois ou mais valores têm a mesma frequência máxima, o conjunto é bimodal ou multimodal.$$, 50),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Análise de Dados$$, $$Julgue o item a seguir.

Um gráfico de setores (pizza) é mais adequado para representar variações de uma grandeza ao longo do tempo do que um gráfico de linhas.$$, 'E', $$Gráficos de linha são mais adequados para mostrar variações ao longo do tempo. Gráficos de pizza (setores) mostram proporções de um todo em um dado momento.$$, 51),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Matemática Financeira$$, $$Julgue o item a seguir.

Um capital de R$ 5.000,00 aplicado a juros simples de 2% ao mês durante 6 meses renderá juros de R$ 600,00.$$, 'C', $$J = C × i × t = 5.000 × 0,02 × 6 = R$ 600,00. Correto.$$, 52),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Matemática Financeira$$, $$Julgue o item a seguir.

Nos juros compostos, os juros de cada período são calculados sobre o capital inicial, sem incorporar os juros anteriores.$$, 'E', $$Nos juros compostos, os juros de cada período são calculados sobre o montante acumulado (capital + juros anteriores). O que calcula sobre o capital inicial é o regime de juros simples.$$, 53),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Matemática Financeira$$, $$Julgue o item a seguir.

Um produto que custa R$ 1.200,00 à vista pode ser parcelado em 4 vezes sem juros de R$ 300,00 cada. O valor total pago nas duas modalidades é o mesmo.$$, 'C', $$4 × R$ 300,00 = R$ 1.200,00. Sem juros significa que o total é igual ao valor à vista. Correto.$$, 54),
  ('11111111-1111-1111-1111-111111111111', $$Matemática$$, $$Matemática Financeira$$, $$Julgue o item a seguir.

A taxa de desconto e a taxa de juro são sempre equivalentes numericamente para um mesmo período.$$, 'E', $$Taxa de desconto e taxa de juro não são equivalentes numericamente. Elas se baseiam em referenciais diferentes (valor futuro vs. valor presente), sendo relacionadas por fórmulas específicas.$$, 55),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Conceitos Fundamentais$$, $$Julgue o item a seguir.

A unidade básica de informação em computação é o bit, que pode assumir apenas dois valores: 0 ou 1.$$, 'C', $$Correto. O bit (binary digit) é a menor unidade de informação digital e só pode assumir os valores 0 ou 1 (sistema binário).$$, 56),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Conceitos Fundamentais$$, $$Julgue o item a seguir.

Um byte equivale a 16 bits.$$, 'E', $$Um byte equivale a 8 bits, não 16. 16 bits equivalem a 2 bytes.$$, 57),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Conceitos Fundamentais$$, $$Julgue o item a seguir.

O processador (CPU) é o componente responsável pelo processamento das instruções e cálculos em um computador.$$, 'C', $$Correto. A CPU (Unidade Central de Processamento) executa instruções, realiza cálculos e coordena o funcionamento dos demais componentes do computador.$$, 58),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Conceitos Fundamentais$$, $$Julgue o item a seguir.

A memória RAM é um tipo de memória não volátil, ou seja, mantém as informações armazenadas mesmo após o desligamento do computador.$$, 'E', $$A RAM (Random Access Memory) é memória VOLÁTIL: perde os dados quando o computador é desligado. A memória não volátil é o HD, SSD ou memória flash.$$, 59),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Conceitos Fundamentais$$, $$Julgue o item a seguir.

Hardware refere-se aos componentes físicos do computador, enquanto software refere-se aos programas e sistemas que o computador executa.$$, 'C', $$Definição correta. Hardware são os componentes físicos (processador, memória, monitor) e software são os programas (sistema operacional, aplicativos).$$, 60),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Aplicativos de Escritório e Comunicação$$, $$Julgue o item a seguir.

No Microsoft Word, o atalho de teclado CTRL+Z desfaz a última ação realizada.$$, 'C', $$Correto. CTRL+Z é o atalho padrão de 'desfazer' (Undo) no Word e na maioria dos programas Windows.$$, 61),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Aplicativos de Escritório e Comunicação$$, $$Julgue o item a seguir.

No Microsoft Excel, a fórmula =SOMA(A1:A5) calcula a soma dos valores nas células A1, A2, A3, A4 e A5.$$, 'C', $$Correto. A notação A1:A5 representa um intervalo de células de A1 até A5, e a função SOMA calcula a soma de todas elas.$$, 62),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Aplicativos de Escritório e Comunicação$$, $$Julgue o item a seguir.

No Microsoft PowerPoint, é possível inserir animações em objetos e transições entre slides.$$, 'C', $$Correto. O PowerPoint permite configurar animações em textos, imagens e formas, além de transições entre os slides da apresentação.$$, 63),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Aplicativos de Escritório e Comunicação$$, $$Julgue o item a seguir.

No Microsoft Outlook, a função "Responder a Todos" (Reply All) envia a resposta apenas ao remetente original da mensagem.$$, 'E', $$'Responder a Todos' envia a resposta ao remetente e a todos os outros destinatários do e-mail original. Para responder apenas ao remetente, usa-se 'Responder' (Reply).$$, 64),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Aplicativos de Escritório e Comunicação$$, $$Julgue o item a seguir.

O Google Docs permite a edição colaborativa em tempo real, possibilitando que múltiplos usuários editem um mesmo documento simultaneamente pela internet.$$, 'C', $$Correto. A edição colaborativa em tempo real é uma das principais funcionalidades do Google Docs, parte do Google Workspace.$$, 65),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Sistemas Operacionais$$, $$Julgue o item a seguir.

O Windows Explorer (ou Explorador de Arquivos) é uma ferramenta do sistema operacional Windows utilizada para gerenciar arquivos e pastas.$$, 'C', $$Correto. O Explorador de Arquivos (File Explorer) do Windows é a interface gráfica para navegar e gerenciar o sistema de arquivos do computador.$$, 66),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Sistemas Operacionais$$, $$Julgue o item a seguir.

O Linux é um sistema operacional de código aberto (open source) e pode ser utilizado e modificado livremente, de acordo com os termos de sua licença.$$, 'C', $$Correto. O Linux é distribuído sob a licença GPL (General Public License), que permite uso, cópia, modificação e distribuição do código-fonte.$$, 67),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Sistemas Operacionais$$, $$Julgue o item a seguir.

A lixeira do Windows armazena permanentemente os arquivos excluídos, sem possibilidade de recuperação.$$, 'E', $$A lixeira armazena temporariamente os arquivos excluídos, permitindo sua recuperação. A exclusão é permanente apenas quando o usuário esvazia a lixeira ou usa SHIFT+DELETE.$$, 68),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Redes e Internet$$, $$Julgue o item a seguir.

O protocolo HTTP é usado para transferência de páginas web, enquanto o HTTPS acrescenta uma camada de segurança por meio da criptografia dos dados transmitidos.$$, 'C', $$Correto. O HTTPS (HTTP Secure) usa criptografia SSL/TLS para proteger a comunicação entre o navegador e o servidor, diferentemente do HTTP simples.$$, 69),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Redes e Internet$$, $$Julgue o item a seguir.

Uma rede LAN (Local Area Network) abrange grandes distâncias geográficas, como países ou continentes.$$, 'E', $$LAN (Rede Local) cobre áreas geográficas pequenas, como um escritório ou prédio. Redes que abrangem grandes distâncias são as WANs (Wide Area Networks).$$, 70),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Redes e Internet$$, $$Julgue o item a seguir.

O endereço IP é um identificador numérico atribuído a cada dispositivo conectado a uma rede que utiliza o protocolo IP para comunicação.$$, 'C', $$Correto. O IP (Internet Protocol) atribui endereços únicos aos dispositivos para identificação e comunicação na rede.$$, 71),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Redes e Internet$$, $$Julgue o item a seguir.

Phishing é um tipo de ataque cibernético que utiliza e-mails ou sites falsos para enganar usuários e obter informações confidenciais, como senhas e dados bancários.$$, 'C', $$Correto. Phishing é uma técnica de engenharia social que simula comunicações legítimas para roubar credenciais e dados pessoais.$$, 72),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Gerenciamento e Segurança da Informação$$, $$Julgue o item a seguir.

Um antivírus é suficiente, por si só, para garantir total segurança a um sistema computacional contra todos os tipos de ameaças.$$, 'E', $$O antivírus é apenas uma camada de proteção. A segurança da informação exige múltiplas camadas: firewall, atualizações, senhas fortes, backup, conscientização do usuário etc.$$, 73),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Gerenciamento e Segurança da Informação$$, $$Julgue o item a seguir.

Ransomware é um tipo de malware que criptografa os arquivos da vítima e exige pagamento (resgate) para liberar o acesso aos dados.$$, 'C', $$Correto. Ransomware (ransom = resgate) sequestra dados criptografando-os e exige pagamento, geralmente em criptomoedas, para fornecer a chave de descriptografia.$$, 74),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Gerenciamento e Segurança da Informação$$, $$Julgue o item a seguir.

O backup é uma cópia de segurança dos dados que permite a recuperação de informações em caso de perda, corrompimento ou exclusão acidental de arquivos.$$, 'C', $$Correto. O backup é fundamental na gestão da segurança da informação, garantindo disponibilidade e integridade dos dados diante de falhas ou incidentes.$$, 75),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Gerenciamento e Segurança da Informação$$, $$Julgue o item a seguir.

Uma senha forte deve conter apenas letras maiúsculas e ter no mínimo 4 caracteres.$$, 'E', $$Uma senha forte deve combinar letras maiúsculas, minúsculas, números e caracteres especiais, com comprimento mínimo recomendado de 8 a 12 caracteres.$$, 76),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Transformação Digital$$, $$Julgue o item a seguir.

A computação em nuvem (cloud computing) permite o acesso a recursos de TI (armazenamento, processamento, softwares) via internet, sem necessidade de infraestrutura local.$$, 'C', $$Correto. A computação em nuvem oferece recursos de TI como serviço via internet, eliminando ou reduzindo a necessidade de infraestrutura física local.$$, 77),
  ('11111111-1111-1111-1111-111111111111', $$Noções de Informática$$, $$Transformação Digital$$, $$Julgue o item a seguir.

A Inteligência Artificial (IA) é exclusivamente utilizada para entretenimento e não tem aplicação em processos administrativos ou de gestão pública.$$, 'E', $$A IA tem ampla aplicação em processos administrativos, como análise de dados, automação de processos, atendimento ao cidadão (chatbots), detecção de fraudes e suporte à decisão na gestão pública.$$, 78),
  ('11111111-1111-1111-1111-111111111111', $$Legislação e Ética$$, $$Ética no Setor Público$$, $$Julgue o item a seguir com base no Decreto nº 1.171/1994 (Código de Ética do Servidor Público).

O servidor público deve tratar com urbanidade e consideração todos os cidadãos que o procuram, independentemente de sua condição social ou econômica.$$, 'C', $$O Código de Ética estabelece o dever de urbanidade e tratamento igualitário a todos os cidadãos, sem discriminação.$$, 79),
  ('11111111-1111-1111-1111-111111111111', $$Legislação e Ética$$, $$Ética no Setor Público$$, $$Julgue o item a seguir com base no Decreto nº 1.171/1994.

É vedado ao servidor público utilizar pessoal ou recursos materiais da repartição para serviços ou atividades particulares.$$, 'C', $$O Código de Ética proíbe expressamente o uso de bens, pessoal e recursos públicos para fins particulares, caracterizando desvio ético e funcional.$$, 80),
  ('11111111-1111-1111-1111-111111111111', $$Legislação e Ética$$, $$Ética no Setor Público$$, $$Julgue o item a seguir.

A moralidade administrativa é princípio constitucional que exige do agente público não apenas atuação legal, mas também conduta ética, honesta e de boa-fé.$$, 'C', $$O princípio da moralidade, previsto no art. 37, caput, da CF/88, vai além da legalidade: exige conduta ética, probidade e boa-fé na atuação do agente público.$$, 81),
  ('11111111-1111-1111-1111-111111111111', $$Legislação e Ética$$, $$Ética no Setor Público$$, $$Julgue o item a seguir.

Conflito de interesses ocorre quando o servidor público utiliza sua posição para obter benefício pessoal em detrimento do interesse público, sendo conduta lícita se não violar norma expressa.$$, 'E', $$O conflito de interesses é conduta ilícita independentemente de violar norma expressa, pois fere os princípios constitucionais da moralidade, impessoalidade e da supremacia do interesse público.$$, 82),
  ('11111111-1111-1111-1111-111111111111', $$Legislação e Ética$$, $$Improbidade Administrativa$$, $$Julgue o item a seguir com base na Lei nº 8.429/1992 (Lei de Improbidade Administrativa).

Aos atos de improbidade que causam enriquecimento ilícito, aplica-se, entre outras sanções, a perda dos bens ou valores acrescidos ilicitamente ao patrimônio.$$, 'C', $$O art. 12, I, da Lei nº 8.429/1992 prevê, para os atos que geram enriquecimento ilícito, a perda dos bens ou valores acrescidos ilicitamente, entre outras sanções.$$, 83),
  ('11111111-1111-1111-1111-111111111111', $$Legislação e Ética$$, $$Improbidade Administrativa$$, $$Julgue o item a seguir.

Após a reforma promovida pela Lei nº 14.230/2021, a improbidade administrativa passou a exigir a comprovação de dolo do agente para sua configuração, sendo excluída a modalidade culposa.$$, 'C', $$A Lei nº 14.230/2021 alterou profundamente a Lei de Improbidade, exigindo dolo específico para configuração de improbidade. A modalidade culposa foi eliminada.$$, 84),
  ('11111111-1111-1111-1111-111111111111', $$Legislação e Ética$$, $$Improbidade Administrativa$$, $$Julgue o item a seguir.

A ação de improbidade administrativa pode ser proposta tanto pelo Ministério Público quanto por qualquer cidadão ou entidade da sociedade civil.$$, 'E', $$Após a Lei nº 14.230/2021, a legitimidade para propor a ação de improbidade ficou exclusiva do Ministério Público, sendo retirada do cidadão e de entidades privadas.$$, 85),
  ('11111111-1111-1111-1111-111111111111', $$Legislação e Ética$$, $$Processo Administrativo$$, $$Julgue o item a seguir com base na Lei nº 9.784/1999 (Lei do Processo Administrativo Federal).

O processo administrativo deve obedecer, entre outros, aos princípios da legalidade, finalidade, motivação, razoabilidade, proporcionalidade, moralidade, ampla defesa, contraditório, segurança jurídica e eficiência.$$, 'C', $$O art. 2º da Lei nº 9.784/1999 elenca todos esses princípios como norteadores do processo administrativo federal.$$, 86),
  ('11111111-1111-1111-1111-111111111111', $$Legislação e Ética$$, $$Processo Administrativo$$, $$Julgue o item a seguir.

Na Lei nº 9.784/1999, o prazo para a Administração decidir sobre recurso administrativo é de 30 dias, prorrogável por igual período, mediante justificativa.$$, 'C', $$O art. 49 da Lei nº 9.784/1999 estabelece prazo de 30 dias para decisão, prorrogável por mais 30 mediante justificativa expressa.$$, 87),
  ('11111111-1111-1111-1111-111111111111', $$Legislação e Ética$$, $$Transparência e Acesso à Informação$$, $$Julgue o item a seguir com base na Lei nº 12.527/2011 (Lei de Acesso à Informação).

O acesso à informação é a regra, e o sigilo é a exceção, segundo os princípios da Lei de Acesso à Informação.$$, 'C', $$Correto. A LAI adota o princípio da máxima publicidade: o acesso é regra e o sigilo deve ser a exceção, devidamente fundamentada em lei.$$, 88),
  ('11111111-1111-1111-1111-111111111111', $$Legislação e Ética$$, $$Transparência e Acesso à Informação$$, $$Julgue o item a seguir.

Pela Lei nº 12.527/2011, o prazo para atendimento de pedido de acesso à informação é de até 20 dias, prorrogável por mais 10 dias.$$, 'C', $$O art. 11 da LAI determina prazo de 20 dias para resposta, com possibilidade de prorrogação por mais 10 dias, mediante justificativa.$$, 89),
  ('11111111-1111-1111-1111-111111111111', $$Legislação e Ética$$, $$Proteção de Dados Pessoais$$, $$Julgue o item a seguir com base na Lei nº 13.709/2018 (LGPD).

A LGPD aplica-se ao tratamento de dados pessoais realizado por pessoa natural ou por pessoa jurídica de direito público ou privado.$$, 'C', $$O art. 1º da LGPD estabelece sua aplicação ao tratamento de dados pessoais por qualquer pessoa, natural ou jurídica, de direito público ou privado.$$, 90),
  ('11111111-1111-1111-1111-111111111111', $$Legislação e Ética$$, $$Proteção de Dados Pessoais$$, $$Julgue o item a seguir com base na LGPD.

Dados pessoais sensíveis incluem, entre outros, dados sobre origem racial ou étnica, convicção religiosa, saúde e dados biométricos, que recebem tratamento diferenciado e mais rigoroso pela Lei.$$, 'C', $$O art. 5º, II, da LGPD define dados sensíveis e o art. 11 estabelece tratamento mais rigoroso para essa categoria, exigindo requisitos específicos para seu processamento.$$, 91),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Noções Administrativas$$, $$Julgue o item a seguir.

A administração pública direta é composta pela Presidência da República, Ministérios e demais órgãos públicos que integram a estrutura do Poder Executivo sem personalidade jurídica própria.$$, 'C', $$Correto. A administração direta é formada por órgãos sem personalidade jurídica própria, que compõem a estrutura centralizada do Estado.$$, 92),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Noções Administrativas$$, $$Julgue o item a seguir.

Autarquias são entidades da administração indireta, criadas por lei, com personalidade jurídica de direito público, patrimônio e receita próprios.$$, 'C', $$Correto. As autarquias têm personalidade jurídica própria de direito público, são criadas por lei específica e exercem atividades típicas de Estado.$$, 93),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Noções Administrativas$$, $$Julgue o item a seguir.

O CRECI (Conselho Regional de Corretores de Imóveis) é uma autarquia federal dotada de poder de polícia para fiscalizar o exercício da profissão de corretor de imóveis.$$, 'C', $$Correto. O CRECI é autarquia federal com poder de fiscalização e regulação do exercício profissional dos corretores de imóveis, nos termos da Lei nº 6.530/1978.$$, 94),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Organização e Estrutura Organizacional$$, $$Julgue o item a seguir.

A estrutura organizacional hierárquica (linear) caracteriza-se pela unidade de comando, em que cada subordinado responde a apenas um superior.$$, 'C', $$Correto. Na estrutura linear, a autoridade flui de forma vertical e cada funcionário tem apenas um superior direto, garantindo unidade de comando.$$, 95),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Organização e Estrutura Organizacional$$, $$Julgue o item a seguir.

O organograma é um instrumento de representação gráfica da estrutura formal de uma organização, indicando os níveis hierárquicos e as relações de subordinação entre os órgãos.$$, 'C', $$Correto. O organograma é a representação visual da estrutura organizacional formal, mostrando hierarquia, departamentos e relações de autoridade.$$, 96),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Comunicação Organizacional$$, $$Julgue o item a seguir.

A comunicação descendente em uma organização flui de níveis hierárquicos superiores para os inferiores, sendo utilizada para transmitir ordens, instruções e políticas da instituição.$$, 'C', $$Correto. A comunicação descendente (top-down) é o fluxo de informações dos superiores para os subordinados, transmitindo diretrizes, metas e instruções.$$, 97),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Comunicação Organizacional$$, $$Julgue o item a seguir.

O ruído na comunicação organizacional refere-se exclusivamente a interferências sonoras que prejudicam a transmissão de mensagens verbais entre os colaboradores.$$, 'E', $$Ruído na comunicação é qualquer interferência que prejudique a compreensão da mensagem, podendo ser físico (som), semântico (interpretação diferente), psicológico ou cultural, não apenas sonoro.$$, 98),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Atendimento ao Público$$, $$Julgue o item a seguir.

No atendimento ao público, a empatia é fundamental para compreender as necessidades do cidadão e oferecer um serviço de qualidade, contribuindo para a satisfação do usuário e a imagem positiva da instituição.$$, 'C', $$A empatia é uma das competências mais importantes no atendimento ao público, permitindo ao servidor compreender a perspectiva do cidadão e oferecer soluções mais adequadas.$$, 99),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Trabalho em Equipe$$, $$Julgue o item a seguir.

O trabalho em equipe pressupõe cooperação, comunicação eficaz e respeito às diferenças individuais, sendo incompatível com situações de conflito, que devem sempre ser evitadas no ambiente organizacional.$$, 'E', $$Conflitos não precisam ser sempre evitados. Conflitos funcionais, quando bem gerenciados, podem estimular a criatividade e a melhoria dos processos. O trabalho em equipe inclui a gestão construtiva dos conflitos.$$, 100),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Controle e Organização de Documentos$$, $$Julgue o item a seguir.

O protocolo é a unidade administrativa responsável pelo recebimento, registro, distribuição e controle da tramitação dos documentos dentro de um órgão.$$, 'C', $$Correto. O protocolo centraliza essas atividades justamente para garantir o rastreamento e a localização dos documentos em qualquer etapa da tramitação.$$, 101),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Controle e Organização de Documentos$$, $$Julgue o item a seguir.

Segundo a teoria das três idades, os documentos de arquivo são classificados em corrente, intermediário e permanente, conforme a frequência de uso e os valores administrativo, legal ou histórico que apresentam.$$, 'C', $$Correto. Documentos correntes estão em uso frequente, os intermediários aguardam eliminação ou recolhimento e os permanentes têm valor histórico/probatório e são preservados definitivamente.$$, 102),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Controle e Organização de Documentos$$, $$Julgue o item a seguir.

A tabela de temporalidade documental tem caráter meramente sugestivo, podendo qualquer servidor decidir, por conta própria, alterar os prazos de guarda ali estabelecidos.$$, 'E', $$Errado. A tabela de temporalidade é um instrumento normativo, aprovado por instância competente (como uma comissão de avaliação de documentos), e sua observância é obrigatória, não facultativa ao servidor.$$, 103),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Controle e Organização de Documentos$$, $$Julgue o item a seguir.

Documentos classificados como de guarda permanente, por possuírem valor histórico ou probatório, podem ser eliminados normalmente após o término de sua utilidade administrativa imediata.$$, 'E', $$Errado. Documentos de valor permanente não são eliminados; eles são recolhidos ao arquivo permanente justamente porque seu valor extrapola a utilidade administrativa imediata.$$, 104),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Controle e Organização de Documentos$$, $$Julgue o item a seguir.

O princípio arquivístico da proveniência (ou respeito aos fundos) estabelece que os documentos produzidos ou acumulados por uma entidade não devem ser misturados aos de outras entidades produtoras.$$, 'C', $$Correto. Esse princípio preserva a organicidade do conjunto documental, mantendo a relação natural entre os documentos e o órgão que os gerou.$$, 105),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Legislação Específica$$, $$Julgue o item a seguir com base na Lei nº 6.530/1978.

O exercício da profissão de Corretor de Imóveis somente é permitido à pessoa física ou jurídica regularmente inscrita no Conselho Regional de Corretores de Imóveis (CRECI) de sua respectiva jurisdição.$$, 'C', $$Correto. A Lei nº 6.530/1978 condiciona o exercício legal da corretagem de imóveis à inscrição prévia no CRECI da região onde o profissional atua.$$, 106),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Legislação Específica$$, $$Julgue o item a seguir.

No sistema COFECI/CRECI, o Conselho Federal de Corretores de Imóveis (COFECI) atua como órgão normativo e de orientação geral, com jurisdição em todo o território nacional, enquanto os Conselhos Regionais (CRECI) fiscalizam o exercício da profissão em suas respectivas áreas.$$, 'C', $$Correto. Essa é a estrutura básica do sistema: o COFECI normatiza e orienta em nível nacional, e cada CRECI fiscaliza e disciplina a profissão dentro de sua área de jurisdição.$$, 107),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Legislação Específica$$, $$Julgue o item a seguir com base no Decreto nº 81.871/1978.

O referido decreto, que regulamenta a Lei nº 6.530/1978, dispensa a inscrição no CRECI para quem comprovar experiência prática na intermediação de imóveis, ainda que não possua habilitação legal para a profissão.$$, 'E', $$Errado. O decreto regulamenta os requisitos para inscrição no CRECI, mas não dispensa essa exigência; a experiência prática, isoladamente, não substitui a inscrição obrigatória no órgão de classe.$$, 108),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Legislação Específica$$, $$Julgue o item a seguir.

Compete ao Conselho Federal de Corretores de Imóveis (COFECI) elaborar e baixar o Código de Ética Profissional dos Corretores de Imóveis, de observância obrigatória em todo o território nacional.$$, 'C', $$Correto. Por ser o órgão normativo de cúpula do sistema, cabe ao COFECI editar o Código de Ética Profissional, que vincula os corretores inscritos em qualquer CRECI do país.$$, 109),
  ('11111111-1111-1111-1111-111111111111', $$Conhecimentos Específicos$$, $$Legislação Específica$$, $$Julgue o item a seguir com base na Lei nº 6.530/1978.

As penalidades disciplinares previstas para infrações cometidas por Corretores de Imóveis se limitam exclusivamente à aplicação de multa pecuniária, não havendo previsão de suspensão ou cancelamento da inscrição profissional.$$, 'E', $$Errado. A legislação prevê uma escala de penalidades que vai além da multa, incluindo advertência, censura, suspensão do exercício profissional e, em casos mais graves, cancelamento da inscrição com apreensão da carteira profissional.$$, 110);
