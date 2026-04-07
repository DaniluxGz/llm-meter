import type OpenAI from 'openai'

// Return the same client type so existing code needs zero changes
export function createWrapper(client: OpenAI): OpenAI {
    return client
}