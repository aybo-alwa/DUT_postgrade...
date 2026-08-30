const FOCUS_BRIEFS: Record<string, string> = {
  Methodology:
    "Interrogate methodological rigour: design fit, sampling, validity, reliability, limitations and feasibility.",
  Epistemology:
    "Interrogate epistemological and theoretical framing: paradigm, ontological assumptions, coherence between theory and method.",
  Tone: "Interrogate academic tone and clarity: hedging, precision, jargon, sentence economy and scholarly register.",
  "Counter-arguments":
    "Surface the strongest counter-arguments, rival explanations and reviewer objections, then suggest how to pre-empt them.",
  Structure:
    "Interrogate argument structure and logical flow: claim, warrant, evidence, signposting and paragraph work.",
};

export async function criticalFriend(focus: string, text: string): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this project yet.");

  const brief = FOCUS_BRIEFS[focus] ?? FOCUS_BRIEFS["Methodology"];

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3.7-flash",
      messages: [
        {
          role: "system",
          content: `You are an AI Critical Friend for postgraduate researchers at a South African university. Be rigorous, specific and kind — never flattering, never harsh. ${brief}
Reply in markdown-free plain text using these labelled sections:
STRENGTHS (2-3 bullets starting with "- ")
RISKS (2-4 bullets starting with "- ")
SHARPEN THIS (2-3 concrete rewrite or next-step actions starting with "- ")
ONE QUESTION TO SIT WITH (a single sentence)
Keep the whole reply under 320 words.`,
        },
        { role: "user", content: text },
      ],
    }),
  });

  if (response.status === 429) throw new Error("The AI Critical Friend is busy. Try again in a moment.");
  if (response.status === 402)
    throw new Error("AI credits are exhausted for this workspace. Top up to keep using the Critical Friend.");
  if (!response.ok) throw new Error(`AI request failed (${response.status}).`);

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("The AI Critical Friend returned an empty response.");
  return content;
}
