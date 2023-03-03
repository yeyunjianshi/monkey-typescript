import { describe, expect, it } from 'vitest'
import { Identifier, LetStatement, Program } from '../src/ast'
import { TokenType } from '../src/token'

describe('AST', () => {
  it('ast', () => {
    const program = new Program()
    const letStatement = new LetStatement(
      {
        type: TokenType.LET,
        literal: 'let',
      },
      new Identifier({ type: TokenType.IDENT, literal: 'myVar' }, 'myVar'),
      new Identifier(
        { type: TokenType.IDENT, literal: 'anotherVar' },
        'anotherVar'
      )
    )
    program.statements.push(letStatement)
    expect(program.toString()).toBe('let myVar = anotherVar;')
  })
})
