export interface MeterData {
    model: string
    inputTokens: number
    outputTokens: number
    usd: number
    latencyMs: number
    unknown?: boolean
    error?: unknown
}

export type Exporter = (data: MeterData) => void

export interface MeterOptions {
    onMetric?: Exporter
    silent?: boolean
    tags?: Record<string, string>
    dynamicPricing?: {
        openrouter?: boolean
    }
}