import type { MeterData } from '../types'

export function logToStdout(data: MeterData): void {
    const cost = data.usd === 0 ? '$0.00' : `$${data.usd.toFixed(6)}`
    const latency = `${(data.latencyMs / 1000).toFixed(2)}s`
    const unknownFlag = data.unknown ? ' [unknown model]' : ''

    console.log(
        `[llm-meter] ${data.model} | in: ${data.inputTokens} | out: ${data.outputTokens} | ${cost} | ${latency}${unknownFlag}`
    )
}