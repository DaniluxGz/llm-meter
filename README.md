# llm-meter

Zero-config cost and latency tracker for OpenAI-compatible API calls.

## Installation

```bash
npm install github:DaniluxGz/llm-meter
```

Requires `openai` as a peer dependency:

```bash
npm install openai
```

## Usage

### Basic

```ts
import OpenAI from 'openai'
import { meter } from 'llm-meter'

const client = meter(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }))

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }],
})

// stdout: [llm-meter] gpt-4o | in: 12 | out: 8 | $0.000180 | 1.23s
```

### Streaming

```ts
const stream = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Count to 5' }],
  stream: true,
  stream_options: { include_usage: true },
})

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? '')
}
// metric emitted after stream ends
```

### Custom exporter

```ts
const client = meter(new OpenAI({ apiKey: '...' }), {
  onMetric: (data) => {
    console.log(data) // { model, inputTokens, outputTokens, usd, latencyMs, unknown?, error? }
  },
})
```

### Silent mode

```ts
const client = meter(new OpenAI({ apiKey: '...' }), { silent: true })
```

## What it logs

```
[llm-meter] gpt-4o | in: 100 | out: 50 | $0.001250 | 1.23s
[llm-meter] unknown-model | in: 0 | out: 0 | $0.00 | 0.50s [unknown model]
[llm-meter] gpt-4o | in: 0 | out: 0 | $0.00 | 0.12s [error: API failure]
```

## Supported models

OpenAI: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-4.1`, `gpt-4.1-mini`, `gpt-4.1-nano`, `gpt-3.5-turbo`, `o1`, `o1-mini`, `o1-pro`, `o3`, `o3-mini`, `o4-mini`

OpenRouter: free models (`nvidia/nemotron-*:free`, `meta-llama/*:free`)

Unknown models report `$0.00` and flag `[unknown model]` in the log.