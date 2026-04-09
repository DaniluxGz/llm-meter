import type OpenAI from 'openai'
import { calculateCost } from './pricing'
import { logToStdout } from './exporters/stdout'

type CreateParams = Parameters<OpenAI['chat']['completions']['create']>[0]

async function interceptCompletion(
    original: Function,
    params: CreateParams
): Promise<any> {
    // Handle streaming
    if ((params as any).stream === true) {
        const start = Date.now()
        const stream = await original(params)

        let inputTokens = 0
        let outputTokens = 0
        let model = (params as any).model

        // Return an async generator that passes chunks through and captures usage
        async function* wrappedStream() {
            for await (const chunk of stream) {
                // Some providers send usage in the last chunk
                if (chunk.usage) {
                    inputTokens = chunk.usage.prompt_tokens ?? 0
                    outputTokens = chunk.usage.completion_tokens ?? 0
                }
                if (chunk.model) model = chunk.model
                yield chunk
            }

            const latencyMs = Date.now() - start
            const { usd } = calculateCost(model, inputTokens, outputTokens)
            logToStdout({ model, inputTokens, outputTokens, usd, latencyMs })
        }

        return wrappedStream()
    }

    // Handle non-streaming (existing logic)
    const start = Date.now()
    const response = await original(params) as OpenAI.Chat.Completions.ChatCompletion
    const latencyMs = Date.now() - start

    const model = response.model ?? (params as any).model
    const inputTokens = response.usage?.prompt_tokens ?? 0
    const outputTokens = response.usage?.completion_tokens ?? 0
    const { usd } = calculateCost(model, inputTokens, outputTokens)

        ; (response as any).__meter = { model, inputTokens, outputTokens, usd, latencyMs }
    logToStdout({ model, inputTokens, outputTokens, usd, latencyMs })

    return response
}

export function createWrapper(client: OpenAI): OpenAI {
    const originalCreate = client.chat.completions.create.bind(client.chat.completions)

        ; (client.chat.completions as any).create = async (params: CreateParams) => {
            return interceptCompletion(originalCreate as any, params)
        }

    return client
}