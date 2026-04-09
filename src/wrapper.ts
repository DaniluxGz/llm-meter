import type OpenAI from 'openai'
import { calculateCost } from './pricing'
import { logToStdout } from './exporters/stdout'

type CreateParams = Parameters<OpenAI['chat']['completions']['create']>[0]

// Intercept a non-streaming completion and attach meter data
async function interceptCompletion(
    original: OpenAI['chat']['completions']['create'],
    params: CreateParams & { stream?: false }
): Promise<ReturnType<OpenAI['chat']['completions']['create']>> {
    const start = Date.now()
    const response = await (original as Function)(params) as OpenAI.Chat.Completions.ChatCompletion
    const latencyMs = Date.now() - start

    const model = response.model ?? params.model
    const inputTokens = response.usage?.prompt_tokens ?? 0
    const outputTokens = response.usage?.completion_tokens ?? 0
    const { usd } = calculateCost(model, inputTokens, outputTokens)

        // Attach meter metadata to the response object for the exporter
        ; (response as any).__meter = { model, inputTokens, outputTokens, usd, latencyMs }
    logToStdout({ model, inputTokens, outputTokens, usd, latencyMs })

    return response as any
}

export function createWrapper(client: OpenAI): OpenAI {
    const originalCreate = client.chat.completions.create.bind(client.chat.completions)

        // Override create — preserve all overloads by casting
        ; (client.chat.completions as any).create = async (params: CreateParams) => {
            return interceptCompletion(originalCreate as any, params as any)
        }

    return client
}