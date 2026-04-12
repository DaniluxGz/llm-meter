// Price per token in USD (raw per-token, not per 1k/1M)
type PriceMap = Record<string, { input: number; output: number }>

const OPENAI: PriceMap = {
    'gpt-4o': { input: 0.000005, output: 0.000015 },
    'gpt-4o-mini': { input: 0.00000015, output: 0.0000006 },
    'gpt-4-turbo': { input: 0.00001, output: 0.00003 },
    'gpt-4.1': { input: 0.000002, output: 0.000008 },
    'gpt-4.1-mini': { input: 0.0000004, output: 0.0000016 },
    'gpt-4.1-nano': { input: 0.0000001, output: 0.0000004 },
    'gpt-3.5-turbo': { input: 0.0000005, output: 0.0000015 },
    'o1': { input: 0.000015, output: 0.00006 },
    'o1-mini': { input: 0.000003, output: 0.000012 },
    'o1-pro': { input: 0.00015, output: 0.0006 },
    'o3': { input: 0.00001, output: 0.00004 },
    'o3-mini': { input: 0.0000011, output: 0.0000044 },
    'o4-mini': { input: 0.0000011, output: 0.0000044 },
}

const OPENROUTER: PriceMap = {
    'nvidia/nemotron-3-super-120b-a12b:free': { input: 0, output: 0 },
    'meta-llama/llama-3-8b-instruct:free': { input: 0, output: 0 },
}

const PRICES: PriceMap = { ...OPENAI, ...OPENROUTER }

export interface CostResult {
    usd: number
    inputTokens: number
    outputTokens: number
    unknown?: boolean
}

export function calculateCost(model: string, inputTokens: number, outputTokens: number): CostResult {
    const normalized = model.replace(/-\d{4}-\d{2}-\d{2}(:[a-z]+)?$/, (_, tag) => tag ?? '')
    const price = PRICES[normalized] ?? PRICES[model]

    if (!price) return { usd: 0, inputTokens, outputTokens, unknown: true }

    return { usd: inputTokens * price.input + outputTokens * price.output, inputTokens, outputTokens }
}