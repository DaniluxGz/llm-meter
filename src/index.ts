import type OpenAI from 'openai'
import { createWrapper } from './wrapper'
import { extendPrices } from './pricing'
import { fetchOpenRouterPrices } from './providers/openrouter'
import type { MeterOptions } from './types'

export type { MeterData, MeterOptions, Exporter } from './types'

export async function meter(client: OpenAI, options: MeterOptions = {}): Promise<OpenAI> {
    if (options.dynamicPricing?.openrouter) {
        try {
            const prices = await fetchOpenRouterPrices()
            extendPrices(prices)
        } catch (err) {
            // Non-fatal: fall back to local price table
            console.warn('[llm-meter] Failed to fetch OpenRouter prices, using local table:', err)
        }
    }

    return createWrapper(client, options)
}