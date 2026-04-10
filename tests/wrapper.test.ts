import { describe, it, expect, vi } from 'vitest'
import { createWrapper } from '../src/wrapper'
import type { MeterData } from '../src/types'
import type OpenAI from 'openai'

const mockResponse = {
    model: 'gpt-4o',
    choices: [{ message: { content: 'Hello' } }],
    usage: { prompt_tokens: 100, completion_tokens: 50 },
}

function makeMockClient() {
    return {
        chat: {
            completions: {
                create: vi.fn().mockResolvedValue(mockResponse),
            },
        },
    } as unknown as OpenAI
}

describe('createWrapper', () => {
    it('returns an object with chat.completions.create', () => {
        const client = makeMockClient()
        const wrapped = createWrapper(client, {})
        expect(typeof wrapped.chat.completions.create).toBe('function')
    })

    it('returns the original response untouched', async () => {
        const client = makeMockClient()
        const wrapped = createWrapper(client, {})
        const result = await wrapped.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: 'hi' }],
        }) as any
        expect(result.choices[0].message.content).toBe('Hello')
        expect(result.__meter).toBeUndefined()
    })

    it('calls onMetric with correct data', async () => {
        const onMetric = vi.fn()
        const client = makeMockClient()
        const wrapped = createWrapper(client, { onMetric })
        await wrapped.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: 'hi' }],
        })
        expect(onMetric).toHaveBeenCalledOnce()
        const data: MeterData = onMetric.mock.calls[0][0]
        expect(data.model).toBe('gpt-4o')
        expect(data.inputTokens).toBe(100)
        expect(data.outputTokens).toBe(50)
        expect(data.usd).toBeGreaterThan(0)
        expect(data.latencyMs).toBeGreaterThanOrEqual(0)
    })

    it('logs to stdout by default', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => { })
        const client = makeMockClient()
        const wrapped = createWrapper(client, {})
        await wrapped.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: 'hi' }],
        })
        expect(log).toHaveBeenCalledWith(expect.stringContaining('[llm-meter]'))
        log.mockRestore()
    })

    it('does not log when silent=true', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => { })
        const client = makeMockClient()
        const wrapped = createWrapper(client, { silent: true })
        await wrapped.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: 'hi' }],
        })
        expect(log).not.toHaveBeenCalled()
        log.mockRestore()
    })
})