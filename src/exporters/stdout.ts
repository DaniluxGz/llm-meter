import type { Exporter } from '../types'

export const logToStdout: Exporter = (data) => {
    const cost = data.usd === 0 ? '$0.00' : `$${data.usd.toFixed(6)}`
    const latency = `${(data.latencyMs / 1000).toFixed(2)}s`
    const flags = [
        data.unknown && '[unknown model]',
        data.error && `[error: ${data.error instanceof Error ? data.error.message : String(data.error)}]`,
    ].filter(Boolean).join(' ')

    console.log(`[llm-meter] ${data.model} | in: ${data.inputTokens} | out: ${data.outputTokens} | ${cost} | ${latency}${flags ? ' ' + flags : ''}`)
}