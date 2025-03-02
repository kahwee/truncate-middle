import { describe, it, expect } from 'vitest'
import truncateMiddle from '../src/index'

describe('truncateMiddle', () => {
  it('should perform a basic test', () => {
    expect(truncateMiddle('the quick brown', 5, 5, '...')).toBe('the q...brown')
  })

  it('should perform auto fill in ellipses', () => {
    expect(truncateMiddle('the quick brown', 5, 5)).toBe('the q&hellip;brown')
  })

  it('should return empty string when null', () => {
    expect(truncateMiddle(null)).toBe('')
  })

  it('should return empty string when undefined', () => {
    expect(truncateMiddle(undefined)).toBe('')
  })

  it('should return empty string when empty', () => {
    expect(truncateMiddle('')).toBe('')
  })

  it('should handle no backLength', () => {
    expect(truncateMiddle('the quick brown', 5, 0)).toBe('the q&hellip;')
  })

  it('should handle 0 backLength, 0 frontLength', () => {
    expect(truncateMiddle('the quick brown', 0, 0)).toBe('the quick brown')
  })

  it('should handle decimal parameters', () => {
    expect(truncateMiddle('the quick brown', 3.7, 4.2, '...')).toBe('the ...rown')
  })
})