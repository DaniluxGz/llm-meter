# llm-meter

Add two lines to your OpenAI-compatible code. Get tokens, cost, and latency logged automatically.

```ts
// Before
const client = new OpenAI({ apiKey: '...' })

// After
const client = await meter(new OpenAI({ apiKey: '...' }))
```
[llm-meter] gpt-4o-mini | in: 120 | out: 43 | $0.000044 | 0.84s

No other changes needed.

---

## Install

```bash
npm install llm-meter
```

---

## Usage

```ts
import OpenAI from 'openai'
import { meter } from 'llm-meter'

const client = await meter(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }))

const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Hello!' }],
})
```

Streaming works the same way — no extra setup.

---

## Works with any OpenAI-compatible API

| Provider     | baseURL                              |
|-------------|---------------------------------------|
| OpenAI      | *(none)*                              |
| OpenRouter  | `https://openrouter.ai/api/v1`        |
| Groq        | `https://api.groq.com/openai/v1`      |
| Together AI | `https://api.together.xyz/v1`         |
| Perplexity  | `https://api.perplexity.ai`           |

---

## Pricing

By default, llm-meter uses a local table with the main OpenAI models.

For OpenRouter, enable dynamic pricing to get real prices for all models:

```ts
const client = await meter(new OpenAI({ ... }), {
    dynamicPricing: { openrouter: true }
})
```

This fetches live prices from OpenRouter on init. If the fetch fails, falls back to the local table.

If a model has no price, cost logs as `$0.00 [unknown model]` — tokens and latency still work.

---

## Options

```ts
meter(client, {
    silent: true,                          // disable logging
    onMetric: (data) => myLogger(data),    // custom exporter
    dynamicPricing: { openrouter: true },  // fetch live prices
})
```

### `MeterData` shape

```ts
{
    model: string
    inputTokens: number
    outputTokens: number
    usd: number
    latencyMs: number
    unknown?: boolean   // true if model price not found
    error?: unknown     // set if the request failed
}
```
