export interface MeterData {
    model: string
    inputTokens: number
    outputTokens: number
    usd: number
    latencyMs: number
}

export function logToStdout(data: MeterData): void {
    const cost = data.usd === 0 ? '$0.00' : `$${data.usd.toFixed(6)}`
    const latency = `${(data.latencyMs / 1000).toFixed(2)}s`

    console.log(
        `[llm-meter] ${data.model} | in: ${data.inputTokens} | out: ${data.outputTokens} | ${cost} | ${latency}`
    )
}