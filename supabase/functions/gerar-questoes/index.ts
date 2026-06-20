import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PROMPT_TEMPLATE = (quantidade: number) => `\
Você é especialista em elaboração de questões para concursos públicos brasileiros.

Gere exatamente ${quantidade} questões inéditas para o cargo de Assistente Administrativo do CRECI-BA, \
no estilo da banca Quadrix (afirmações julgadas como Certo ou Errado).

Distribua entre estas 5 disciplinas:
- Português (Interpretação de Texto, Gramática, Redação Oficial)
- Matemática (Raciocínio Lógico, Matemática Básica, Porcentagem)
- Noções de Informática (Windows, Office, Internet, Segurança Digital)
- Legislação e Ética (Ética no Serviço Público, Legislação do CRECI, Lei 6.530/78)
- Conhecimentos Específicos (Mercado Imobiliário, CRECI, Código Civil — Direito Imobiliário)

Responda APENAS com um array JSON válido, sem texto antes ou depois:
[
  {
    "disciplina": "Português",
    "assunto": "Interpretação de Texto",
    "enunciado": "Texto completo da questão, incluindo contexto e afirmação a julgar.",
    "gabarito": "C",
    "explicacao": "Justificativa objetiva de por que o gabarito é Certo ou Errado."
  }
]

Regras obrigatórias:
- enunciado: apresente um pequeno texto, lei, conceito ou situação e depois faça uma afirmação para julgar
- gabarito: apenas "C" (Certo) ou "E" (Errado) — nunca outro valor
- explicacao: explique objetivamente por que o gabarito está correto
- Varie os assuntos e o gabarito (aproximadamente metade C, metade E)
- Dificuldade média, realista para concurso público de nível médio
- Gere exatamente ${quantidade} questões no array`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { simulado_id, quantidade = 10 } = await req.json();

    if (!simulado_id) {
      return new Response(
        JSON.stringify({ error: "simulado_id é obrigatório" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const qtd = Math.min(Math.max(1, Number(quantidade) || 10), 20);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: maxRow } = await supabase
      .from("questoes")
      .select("ordem")
      .eq("simulado_id", simulado_id)
      .order("ordem", { ascending: false })
      .limit(1)
      .maybeSingle();

    const ordemBase = (maxRow?.ordem ?? 0) + 1;

    const anthropic = new Anthropic({
      apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
    });

    const stream = await anthropic.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      messages: [{ role: "user", content: PROMPT_TEMPLATE(qtd) }],
    });

    const message = await stream.finalMessage();

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Claude não retornou texto");
    }

    const texto = textBlock.text.trim();
    const match = texto.match(/\[[\s\S]*\]/);
    if (!match) {
      throw new Error("Array JSON não encontrado na resposta do Claude");
    }

    const geradas: unknown[] = JSON.parse(match[0]);

    const validas = (geradas as Record<string, unknown>[]).filter(
      (q) =>
        q &&
        typeof q.disciplina === "string" && q.disciplina.trim() &&
        typeof q.assunto === "string" && q.assunto.trim() &&
        typeof q.enunciado === "string" && q.enunciado.trim() &&
        ["C", "E"].includes(q.gabarito as string) &&
        typeof q.explicacao === "string" && q.explicacao.trim()
    );

    if (validas.length === 0) {
      throw new Error("Nenhuma questão válida na resposta do Claude");
    }

    const rows = validas.map((q, i) => ({
      simulado_id,
      disciplina: (q.disciplina as string).trim(),
      assunto: (q.assunto as string).trim(),
      enunciado: (q.enunciado as string).trim(),
      gabarito: q.gabarito as string,
      explicacao: (q.explicacao as string).trim(),
      ordem: ordemBase + i,
    }));

    const { data, error } = await supabase
      .from("questoes")
      .insert(rows)
      .select("id");

    if (error) throw error;

    return new Response(
      JSON.stringify({ inseridas: data?.length ?? 0 }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[gerar-questoes]", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
      }
    );
  }
});
