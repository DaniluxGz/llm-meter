import { describe, it, expect, vi } from 'vitest'
import { createWrapper } from '../src/wrapper'
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
        const wrapped = createWrapper(client)
        expect(typeof wrapped.chat.completions.create).toBe('function')
    })

    it('returns the same response as the original', async () => {
        const client = makeMockClient()
        const wrapped = createWrapper(client)
        const result = await wrapped.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: 'hi' }],
        }) as any
        expect(result.choices[0].message.content).toBe('Hello')
    })

    it('attaches __meter metadata to the response', async () => {
        const client = makeMockClient()
        const wrapped = createWrapper(client)
        const result = await wrapped.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: 'hi' }],
        }) as any
        expect(result.__meter).toBeDefined()
        expect(result.__meter.inputTokens).toBe(100)
        expect(result.__meter.outputTokens).toBe(50)
        expect(result.__meter.usd).toBeGreaterThanOrEqual(0)
    })
    it('logs to stdout after a completion', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => { })
        const client = makeMockClient()
        const wrapped = createWrapper(client)
        await wrapped.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: 'hi' }],
        })
        expect(log).toHaveBeenCalledWith(expect.stringContaining('[llm-meter]'))
        log.mockRestore()
    })

})