import OpenAI from 'openai'
import { config } from 'dotenv'
import { meter } from '../src/index'

config()

async function main() {
    const client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
    })

    const wrapped = meter(client)

    const response = await wrapped.chat.completions.create({
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        messages: [{ role: 'user', content: 'Say hello in one word.' }],
    })

    console.log(response.choices[0].message.content)
    console.log('usage:', response.usage)
}

main()