import { describe, expect, it } from 'vitest'
import { add } from '../src'

describe('suite', () => {
  it('add', () => {
    expect(add(1, 2)).toBe(3)
  })
})
