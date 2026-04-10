// Price per token in USD (raw per-token, not per 1k/1M)
const PRICES: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 0.000005, output: 0.000015 },
    'gpt-4o-mini': { input: 0.00000015, output: 0.0000006 },
    'gpt-4-turbo': { input: 0.00001, output: 0.00003 },
    'gpt-3.5-turbo': { input: 0.0000005, output: 0.0000015 },
    'nvidia/nemotron-3-super-120b-a12b:free': { input: 0, output: 0 },
    'meta-llama/llama-3-8b-instruct:free': { input: 0, output: 0 },
}

export interface CostResult {
    usd: number
    inputTokens: number
    outputTokens: number
    unknown?: boolean
}

export function calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number
): CostResult {
    // Strip date suffix: e.g. "gpt-4o-2024-11-20" → "gpt-4o"
    const normalized = model.replace(/-\d{4}-\d{2}-\d{2}(:[a-z]+)?$/, (_, tag) => tag ?? '')
    const price = PRICES[normalized] ?? PRICES[model]

    if (!price) {
        return { usd: 0, inputTokens, outputTokens, unknown: true }
    }

    const usd = inputTokens * price.input + outputTokens * price.output
    return { usd, inputTokens, outputTokens }
}