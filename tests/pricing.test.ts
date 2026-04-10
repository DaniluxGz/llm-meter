import { calculateCost } from '../src/pricing'
import { describe, it, expect } from 'vitest'

describe('calculateCost', () => {
    it('returns correct cost for gpt-4o', () => {
        const result = calculateCost('gpt-4o', 1000, 500)
        expect(result.usd).toBeCloseTo(0.000005 * 1000 + 0.000015 * 500)
    })

    it('returns usd=0 and unknown=true for unknown model', () => {
        const result = calculateCost('unknown-model', 100, 100)
        expect(result.usd).toBe(0)
        expect(result.unknown).toBe(true)
    })

    it('returns 0 cost for free models', () => {
        const result = calculateCost('meta-llama/llama-3-8b-instruct:free', 500, 500)
        expect(result.usd).toBe(0)
        expect(result.unknown).toBeUndefined()
    })

    it('normalizes date-suffixed model names', () => {
        const result = calculateCost('gpt-4o-2024-11-20', 1000, 500)
        expect(result.usd).toBeCloseTo(0.000005 * 1000 + 0.000015 * 500)
        expect(result.unknown).toBeUndefined()
    })
})