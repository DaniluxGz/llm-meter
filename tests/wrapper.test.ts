import { describe, it, expect, vi } from 'vitest'
import { meter } from '../src/index'

// Minimal mock that mirrors the OpenAI client shape we use
const mockCreate = vi.fn().mockResolvedValue({
    id: 'chatcmpl-test',
    model: 'gpt-4o-mini',
    choices: [{ message: { content: 'hello' } }],
    usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
})

const mockClient = {
    chat: {
        completions: {
            create: mockCreate,
        },
    },
} as any

describe('meter wrapper', () => {
    it('returns an object with chat.completions.create', () => {
        const wrapped = meter(mockClient)
        expect(wrapped.chat.completions.create).toBeDefined()
    })

    it('proxies create() and returns the same response', async () => {
        const wrapped = meter(mockClient)
        const result = await wrapped.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'hi' }],
        } as any)
        expect(result.usage?.prompt_tokens).toBe(10)
        expect(result.choices[0].message.content).toBe('hello')
    })
})