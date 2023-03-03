import { LookupIdent, Token, TokenType } from './token'
import type { Int, Char } from './types'

export const CharZero = String.fromCharCode(0)

export class Lexer {
  input: string
  position: Int = 0
  readPosition: Int = 0
  ch: Char = String.fromCharCode(0)

  constructor(input: string) {
    this.input = input
    this.readChar()
  }

  nextToken() {
    let token: Token

    this.skipWhitespace()
    switch (this.ch) {
      case '=':
        if (this.peekChar() === '=') {
          const ch = this.ch
          this.readChar()
          const literal = ch + this.ch
          token = { type: TokenType.EQ, literal } as Token
        } else {
          token = newToken(TokenType.ASSIGN, this.ch)
        }
        break
      case '+':
        token = newToken(TokenType.PLUS, this.ch)
        break
      case '-':
        token = newToken(TokenType.MINUS, this.ch)
        break
      case '!':
        if (this.peekChar() === '=') {
          const ch = this.ch
          this.readChar()
          const literal = ch + this.ch
          token = { type: TokenType.NOT_EQ, literal } as Token
        } else {
          token = newToken(TokenType.BANG, this.ch)
        }
        break
      case '/':
        token = newToken(TokenType.SLASH, this.ch)
        break
      case '*':
        token = newToken(TokenType.ASTERISK, this.ch)
        break
      case '<':
        token = newToken(TokenType.LT, this.ch)
        break
      case '>':
        token = newToken(TokenType.GT, this.ch)
        break
      case ';':
        token = newToken(TokenType.SEMICOLON, this.ch)
        break
      case ',':
        token = newToken(TokenType.COMMA, this.ch)
        break
      case '{':
        token = newToken(TokenType.LBRACE, this.ch)
        break
      case '}':
        token = newToken(TokenType.RBRACE, this.ch)
        break
      case '(':
        token = newToken(TokenType.LPAREN, this.ch)
        break
      case ')':
        token = newToken(TokenType.RPAREN, this.ch)
        break
      case CharZero:
        token = newToken(TokenType.EOF, '')
        break
      default:
        if (isLetter(this.ch)) {
          const literal = this.readIdentifier()
          const tokenType = LookupIdent(literal)
          return newToken(tokenType, literal)
        } else if (isDigit(this.ch)) {
          const literal = this.readNumber()
          const tokenType = TokenType.INT
          return newToken(tokenType, literal)
        } else {
          token = newToken(TokenType.ILLEGAL, this.ch)
        }
        break
    }
    this.readChar()
    return token
  }

  readChar() {
    this.ch = this.peekChar()
    this.position = this.readPosition
    this.readPosition += 1
  }

  skipWhitespace() {
    while (
      this.ch === ' ' ||
      this.ch === '\t' ||
      this.ch === '\n' ||
      this.ch === '\r'
    ) {
      this.readChar()
    }
  }

  peekChar(): Char {
    return this.readPosition >= this.input.length
      ? CharZero
      : this.input[this.readPosition]
  }

  readIdentifier() {
    const position = this.position
    while (isLetter(this.ch)) {
      this.readChar()
    }
    return this.input.slice(position, this.position)
  }

  readNumber() {
    const position = this.position
    while (isDigit(this.ch)) {
      this.readChar()
    }
    return this.input.slice(position, this.position)
  }
}

export function isLetter(ch: Char) {
  return ('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z') || ch == '_'
}

export function isDigit(ch: Char) {
  return '0' <= ch && ch <= '9'
}

export function newToken(tokenType: TokenType, ch: Char) {
  return { type: tokenType, literal: ch } as Token
}
