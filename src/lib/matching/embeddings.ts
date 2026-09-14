import { env } from "@/lib/env";

/**
 * Pluggable semantic layer.
 * Structured scores are authoritative. Embeddings only supplement.
 * When no provider is configured, we use a lexical token vector — not "AI".
 */

export interface EmbeddingProvider {
  name: string;
  embed(text: string): Promise<number[]>;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

export class LexicalEmbeddingProvider implements EmbeddingProvider {
  name = "lexical-stub";

  async embed(text: string): Promise<number[]> {
    const tokens = tokenize(text);
    const dim = 64;
    const vec = new Array<number>(dim).fill(0);
    for (const token of tokens) {
      let h = 0;
      for (let i = 0; i < token.length; i++) {
        h = (h * 31 + token.charCodeAt(i)) >>> 0;
      }
      vec[h % dim] += 1;
    }
    const norm = Math.sqrt(vec.reduce((s, n) => s + n * n, 0)) || 1;
    return vec.map((n) => n / norm);
  }
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  name = "openai";

  async embed(text: string): Promise<number[]> {
    if (!env.openaiApiKey) {
      return new LexicalEmbeddingProvider().embed(text);
    }
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.embeddingModel,
        input: text.slice(0, 8000),
      }),
    });
    if (!res.ok) {
      return new LexicalEmbeddingProvider().embed(text);
    }
    const json = (await res.json()) as { data: { embedding: number[] }[] };
    return json.data[0]?.embedding ?? new LexicalEmbeddingProvider().embed(text);
  }
}

export function cosine(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}

export function getEmbeddingProvider(): EmbeddingProvider {
  if (env.embeddingProvider === "openai" && env.openaiApiKey) {
    return new OpenAIEmbeddingProvider();
  }
  return new LexicalEmbeddingProvider();
}

export function profileCorpus(parts: string[][]): string {
  return parts.flat().join(" · ");
}
