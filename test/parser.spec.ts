import { describe, expect, it } from 'vitest'
import { IntegerLiteral, LetStatement } from '../src/ast'
import { Lexer } from '../src/lexer'
import { Parser } from '../src/parser'

describe('Parser', () => {
  it('parse let statement', () => {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;[
      { input: 'let x = 5;', ident: 'x', value: 5 },
      {
        input: 'let y = true;',
        ident: 'y',
        value: true,
      },
      {
        input: 'let z = false;',
        ident: 'z',
        value: false,
      },
      {
        input: 'let foobar = y;',
        ident: 'foobar',
        value: 'y',
      },
    ].forEach((test) => {
      const parser = new Parser(new Lexer(test.input))
      const program = parser.parseProgram()

      checkProgramErrors(parser)

      const stmt = program.statements[0]
      expect(stmt instanceof LetStatement).toBe(true)

      expect((stmt as LetStatement).name?.tokenLiteral()).toBe(test.ident)
      expect(((stmt as LetStatement).value as IntegerLiteral).value).toBe(
        test.value
      )
    })
  })
})

function checkProgramErrors(parser: Parser) {
  if (parser.errors.length > 0) console.log(parser.errors)
  expect(parser.errors.length).toBe(0)
}
