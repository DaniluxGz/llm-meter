import type OpenAI from 'openai'
import { createWrapper } from './wrapper'
import type { MeterOptions } from './types'

export type { MeterData, MeterOptions, Exporter } from './types'

export function meter(client: OpenAI, options: MeterOptions = {}): OpenAI {
    return createWrapper(client, options)
}