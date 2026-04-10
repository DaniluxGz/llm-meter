import type OpenAI from 'openai'
import type { MeterOptions } from './types'
import { calculateCost } from './pricing'
import { logToStdout } from './exporters/stdout'

type CreateFn = OpenAI['chat']['completions']['create']
type CreateParams = Parameters<CreateFn>[0]
type CompletionResponse = OpenAI.Chat.Completions.ChatCompletion
type StreamChunk = OpenAI.Chat.Completions.ChatCompletionChunk

async function interceptCompletion(
    original: CreateFn,
    params: CreateParams,
    options: MeterOptions
): Promise<CompletionResponse | AsyncGenerator<StreamChunk>> {
    const emit = options.silent
        ? undefined
        : (options.onMetric ?? logToStdout)

    // Streaming path
    if (params.stream === true) {
        const start = Date.now()
        const stream = await (original as (p: CreateParams) => Promise<AsyncIterable<StreamChunk>>)(params)

        let inputTokens = 0
        let outputTokens = 0
        let model = params.model

        async function* wrappedStream(): AsyncGenerator<StreamChunk> {
            for await (const chunk of stream) {
                if (chunk.usage) {
                    inputTokens = chunk.usage.prompt_tokens ?? 0
                    outputTokens = chunk.usage.completion_tokens ?? 0
                }
                if (chunk.model) model = chunk.model
                yield chunk
            }

            const latencyMs = Date.now() - start
            const { usd, unknown } = calculateCost(model, inputTokens, outputTokens)
            emit?.({ model, inputTokens, outputTokens, usd, latencyMs, unknown })
        }

        return wrappedStream()
    }

    // Non-streaming path
    const start = Date.now()
    let response: CompletionResponse
    try {
        response = await (original as (p: CreateParams) => Promise<CompletionResponse>)(params)
    } catch (error) {
        const latencyMs = Date.now() - start
        emit?.({ model: params.model, inputTokens: 0, outputTokens: 0, usd: 0, latencyMs, error })
        throw error
    }
    const latencyMs = Date.now() - start

    const model = response.model ?? params.model
    const inputTokens = response.usage?.prompt_tokens ?? 0
    const outputTokens = response.usage?.completion_tokens ?? 0
    const { usd, unknown } = calculateCost(model, inputTokens, outputTokens)

    emit?.({ model, inputTokens, outputTokens, usd, latencyMs, unknown })

    return response
}

export function createWrapper(client: OpenAI, options: MeterOptions): OpenAI {
    const originalCreate = client.chat.completions.create.bind(client.chat.completions) as CreateFn

        ; (client.chat.completions as { create: unknown }).create = (params: CreateParams) =>
            interceptCompletion(originalCreate, params, options)

    return client
}