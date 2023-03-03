import {
  Expression,
  Identifier,
  IntegerLiteral,
  LetStatement,
  Program,
  Boolean,
  ReturnStatement,
  ExpressionStatement,
  PrefixExpression,
  InfixExpression,
  IfExpression,
  BlockStatement,
} from './ast'
import { Lexer } from './lexer'
import { Token, TokenType } from './token'

enum Precedence {
  LOWEST = 1,
  EQUALS, // ==
  LESSGREATER, // > or <
  SUM, // +
  PRODUCT, // *
  PREFIX, // -X or !X
  CALL, // myFunction(X)
}

const precedences = new Map<TokenType, Precedence>([
  [TokenType.EQ, Precedence.EQUALS],
  [TokenType.NOT_EQ, Precedence.EQUALS],
  [TokenType.LT, Precedence.LESSGREATER],
  [TokenType.GT, Precedence.LESSGREATER],
  [TokenType.PLUS, Precedence.SUM],
  [TokenType.MINUS, Precedence.SUM],
  [TokenType.SLASH, Precedence.PRODUCT],
  [TokenType.ASSIGN, Precedence.PRODUCT],
  [TokenType.LPAREN, Precedence.CALL],
])

type PrefixParseFunction = () => Expression | undefined
type InfixParseFunction = (expression: Expression) => Expression | undefined

export class Parser {
  lexer: Lexer
  errors: string[] = []

  curToken!: Token
  peekToken!: Token

  prefixParseFns = new Map<TokenType, PrefixParseFunction>()
  infixParseFns = new Map<TokenType, InfixParseFunction>()

  constructor(lexer: Lexer) {
    this.lexer = lexer

    this.registerPrefix(TokenType.IDENT, this.parseIdentifier.bind(this))
    this.registerPrefix(TokenType.INT, this.parseIntegerLiteral.bind(this))
    this.registerPrefix(TokenType.TRUE, this.parseBoolean.bind(this))
    this.registerPrefix(TokenType.FALSE, this.parseBoolean.bind(this))

    this.nextToken()
    this.nextToken()
  }

  nextToken() {
    this.curToken = this.peekToken
    this.peekToken = this.lexer.nextToken()
  }

  curToTokenIs(type: TokenType) {
    return this.curToken.type === type
  }

  peekTokenIs(type: TokenType) {
    return this.peekToken.type === type
  }

  expectPeek(type: TokenType) {
    if (this.peekTokenIs(type)) {
      this.nextToken()
      return true
    }
    this.peekError(type)
    return false
  }

  parseProgram() {
    const program = new Program()

    while (!this.curToTokenIs(TokenType.EOF)) {
      const stmt = this.parseStatement()
      if (stmt) {
        program.statements.push(stmt)
      }
      this.nextToken()
    }

    return program
  }

  parseStatement() {
    switch (this.curToken.type) {
      case TokenType.LET:
        return this.parseLetStatement()
    }
  }

  parseLetStatement() {
    const statement = new LetStatement(this.curToken)

    if (!this.expectPeek(TokenType.IDENT)) {
      return undefined
    }

    statement.name = new Identifier(this.curToken, this.curToken.literal)

    if (!this.expectPeek(TokenType.ASSIGN)) {
      return undefined
    }

    this.nextToken()

    statement.value = this.parseExpression(Precedence.LOWEST)

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken()
    }

    return statement
  }

  parseReturnExpression() {
    const stmt = new ReturnStatement(this.curToken)

    this.nextToken

    stmt.returnValue = this.parseExpression(Precedence.LOWEST)

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken()
    }

    return stmt
  }

  parseExpressionStatement() {
    const stmt = new ExpressionStatement(this.curToken)
    stmt.expression = this.parseExpression(Precedence.LOWEST)

    if (this.peekTokenIs(TokenType.SEMICOLON)) this.nextToken()

    return stmt
  }

  parseExpression(precedence: Precedence) {
    const prefixFn = this.prefixParseFns.get(this.curToken.type)

    if (!prefixFn) {
      this.noPrefixParseFnError(this.curToken.type)
      return undefined
    }

    let leftExp = prefixFn()

    while (
      leftExp &&
      !this.peekTokenIs(TokenType.SEMICOLON) &&
      precedence < this.peekPrecedence()
    ) {
      const infixFn = this.infixParseFns.get(this.peekToken.type)
      if (!infixFn) return leftExp

      this.nextToken()
      leftExp = infixFn(leftExp)
    }

    return leftExp
  }

  parseIdentifier(): Expression {
    return new Identifier(this.curToken, this.curToken.literal)
  }

  parseBoolean(): Expression {
    return new Boolean(this.curToken, this.curToTokenIs(TokenType.TRUE))
  }

  parseIntegerLiteral(): Expression | undefined {
    const literal = new IntegerLiteral(this.curToken)
    try {
      const value = parseInt(this.curToken.literal, 10)
      literal.value = value
      return literal
    } catch (e) {
      this.errors.push(`could not parse ${this.curToken.literal} as integer`)
      return undefined
    }
  }

  parsePrefixExpression() {
    const expression = new PrefixExpression(
      this.curToken,
      this.curToken.literal
    )
    this.nextToken()

    expression.right = this.parseExpression(Precedence.PREFIX)

    return expression
  }

  parseInfixExpression(left: Expression) {
    const expression = new InfixExpression(
      this.curToken,
      this.curToken.literal,
      left
    )

    const precedence = this.curPrecedence()
    this.nextToken()
    expression.right = this.parseExpression(precedence)

    return expression
  }

  parseGroupedExpression() {
    this.nextToken()
    const exp = this.parseExpression(Precedence.LOWEST)

    if (this.expectPeek(TokenType.RPAREN)) return undefined
    return exp
  }

  parseIfExpression() {
    const expression = new IfExpression(this.curToken)
    if (this.expectPeek(TokenType.LPAREN)) return undefined
    this.nextToken()

    expression.condition = this.parseExpression(Precedence.LOWEST)

    if (this.expectPeek(TokenType.RPAREN)) return undefined
    if (this.expectPeek(TokenType.LBRACE)) return undefined

    expression.consequence = this.parseBlockStatement()
  }

  parseBlockStatement() {
    const block = new BlockStatement(this.curToken)
    this.nextToken()
    while (
      !this.curToTokenIs(TokenType.RBRACE) &&
      !this.curToTokenIs(TokenType.EOF)
    ) {
      const stmt = this.parseStatement()
      if (stmt) block.statements.push(stmt)
      this.nextToken()
    }
    return block
  }

  parseFunctionLiteral() {}

  parseFunctionParameters() {
    const identifiers: Identifier[] = []

    if (this.peekTokenIs(TokenType.RPAREN)) {
      this.nextToken()
      return identifiers
    }

    this.nextToken()

    const ident = new Identifier(this.curToken, this.curToken.literal)
    identifiers.push(ident)

    while (this.peekTokenIs(TokenType.COMMA)) {
      this.nextToken()
      this.nextToken()
      const ident = new Identifier(this.curToken, this.curToken.literal)
      identifiers.push(ident)
    }

    if (this.expectPeek(TokenType.RPAREN)) {
      return undefined
    }

    return identifiers
  }

  peekPrecedence() {
    return precedences.get(this.peekToken.type) ?? Precedence.LOWEST
  }

  curPrecedence() {
    return precedences.get(this.curToken.type) ?? Precedence.LOWEST
  }

  peekError(type: TokenType) {
    this.errors.push(
      `expected next token to be ${type}, got %s instead ${this.peekToken.type}`
    )
  }

  noPrefixParseFnError(type: TokenType) {
    this.errors.push(`no prefix parse function for ${type} found`)
  }

  registerPrefix(type: TokenType, fn: PrefixParseFunction) {
    this.prefixParseFns.set(type, fn)
  }

  registerInfix(type: TokenType, fn: InfixParseFunction) {
    this.infixParseFns.set(type, fn)
  }
}
