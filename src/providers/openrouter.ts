import type { PriceMap } from '../pricing'

const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models'

interface OpenRouterModel {
    id: string
    pricing: {
        prompt: string   // price per token as string, e.g. "0.000005"
        completion: string
    }
}

interface OpenRouterResponse {
    data: OpenRouterModel[]
}

export async function fetchOpenRouterPrices(): Promise<PriceMap> {
    const res = await fetch(OPENROUTER_MODELS_URL)
    if (!res.ok) throw new Error(`OpenRouter models fetch failed: ${res.status}`)

    const json: OpenRouterResponse = await res.json()

    const map: PriceMap = {}
    for (const model of json.data) {
        const input = parseFloat(model.pricing.prompt)
        const output = parseFloat(model.pricing.completion)
        if (!isNaN(input) && !isNaN(output)) {
            map[model.id] = { input, output }
        }
    }
    return map
}