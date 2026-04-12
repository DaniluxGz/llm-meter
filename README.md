# llm-meter

Zero-config cost and latency tracker for OpenAI-compatible API calls.

> [!NOTE]
> `llm-meter` acts as a transparent wrapper around your standard OpenAI client. It automatically intercepts requests to calculate exact token usage, cost in USD, and latency, logging it directly to your console without requiring architectural changes.

## Features

- **Zero friction**: Two lines of code to integrate with your existing OpenAI client.
- **Cost & Latency Tracking**: Real-time logging of your request metrics.
- **Streaming support**: Seamlessly intercepts chunks to accurately report usage at the end of the stream.
- **Multi-provider compatibility**: Built for OpenAI, OpenRouter (with dynamic pricing), Groq, Together AI, Perplexity, and Azure OpenAI.

## Getting Started

### Prerequisites

- Node.js >= 18
- An existing project using the `openai` SDK (`>=4.0.0`)

### Installation

Install the package directly from GitHub:

```bash
npm install github:DaniluxGz/llm-meter
```

## Quickstart

Wrap your existing OpenAI client with the `meter` function.

```typescript
import OpenAI from 'openai';
import { meter } from 'llm-meter';

// 1. Initialize your base client 
const baseClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 2. Wrap it with `meter`
const client = await meter(baseClient);

// 3. Send requests as usual!
const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Hello!' }],
});
```

A transparent log will securely output the cost breakdown to stdout:
```text
[llm-meter] gpt-4o-mini | in: 120 | out: 43 | $0.000044 | 0.84s
```

> [!TIP]
> Streaming is fully supported natively! Use `stream: true` and `stream_options: { include_usage: true }` in your standard requests and it will track tokens out of the box.

## Advanced Usage

### OpenRouter & Dynamic Pricing

You can enable dynamic pricing to automatically fetch the live cost table directly from OpenRouter, ensuring accurate `$USD` calculation for hundreds of models.

```typescript
const client = await meter(new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
}), {
    dynamicPricing: { openrouter: true }
});
```

> [!TIP]
> This configuration guarantees that `llm-meter` will recognize OpenRouter models (`nvidia/nemotron-...`, `anthropic/...`, etc.) and log their precise costs instantly.

### Custom Exporters and Options

`llm-meter` can be configured easily. If you do not want stdout logs and prefer a custom metric collector (like Datadog or a database), pass `MeterOptions`: 

```typescript
meter(client, {
    silent: true, // Disable standard stdout logging
    onMetric: (data) => {
        // Your custom metric pipeline
        myCustomLogger(data.model, data.usd, data.latencyMs);
    }
});
```

The underlying payload (`MeterData`) looks like this:
```typescript
{
    model: string;
    inputTokens: number;
    outputTokens: number;
    usd: number;
    latencyMs: number;
    unknown?: boolean; // true if model price was not found in active tables
    error?: unknown;   // set if the API request failed
}
```