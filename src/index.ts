import type OpenAI from 'openai'
import { createWrapper } from './wrapper'

export interface MeterOptions {
    // Placeholder for future options (exporters, filters, etc.)
}

export function meter(client: OpenAI, _options: MeterOptions = {}): OpenAI {
    return createWrapper(client)
}