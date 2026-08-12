import { Mistral } from "@mistralai/mistralai";

export function getMistral(apiKey?: string | null) {
  const key = apiKey?.trim() || process.env.MISTRAL_API_KEY;
  if (!key) {
    throw new Error(
      "Mistral API key missing. Add MISTRAL_API_KEY to .env or paste your key in Settings.",
    );
  }
  return new Mistral({ apiKey: key });
}
