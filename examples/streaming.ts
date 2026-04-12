import OpenAI from 'openai'
import { config } from 'dotenv'
import { meter } from '../src/index'

config()

async function main() {
    const client = await meter(new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
    }), {
        dynamicPricing: { openrouter: true }
    })

    const stream = await client.chat.completions.create({
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        messages: [{ role: 'user', content: 'Count from 1 to 5.' }],
        stream: true,
        stream_options: { include_usage: true },
    } as any)

    process.stdout.write('Response: ')
    for await (const chunk of stream as any) {
        const text = chunk.choices?.[0]?.delta?.content ?? ''
        process.stdout.write(text)
    }
    console.log()
}

main()