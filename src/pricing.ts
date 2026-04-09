// Price per token in USD (not per 1k/1M — raw per-token for direct multiplication)
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
}

// src/pricing.ts — update calculateCost()
export function calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number
): CostResult {
    // Strip date suffix added by some providers (e.g. "-20230311")
    const normalizedModel = model.replace(/-\d{8}(:[a-z]+)?$/, (_, tag) => tag ?? '')
    const price = PRICES[normalizedModel] ?? PRICES[model]

    if (!price) {
        console.warn(`[llm-meter] Unknown model "${model}" — cost reported as $0.00`)
        return { usd: 0, inputTokens, outputTokens }
    }

    const usd = inputTokens * price.input + outputTokens * price.output
    return { usd, inputTokens, outputTokens }
}