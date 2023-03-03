import { Token } from './token'
import { Int } from './types'

export interface ASTNode {
  tokenLiteral(): string
}

export interface Statement extends ASTNode {
  statementNode(): void
}

export interface Expression extends ASTNode {
  expressionNode(): void
}

export class Program implements ASTNode {
  statements: Statement[] = []

  tokenLiteral(): string {
    return this.statements.length > 0 ? this.statements[0].tokenLiteral() : ''
  }

  toString() {
    return this.statements.map((s) => s.toString()).join('\n')
  }
}

export class LetStatement implements Statement {
  constructor(
    public token: Token,
    public name?: Identifier,
    public value?: Expression
  ) {}

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }

  toString() {
    return `${this.tokenLiteral()} ${this.name} = ${this.value};`
  }
}

export class ReturnStatement implements Statement {
  constructor(public token: Token, public returnValue?: Expression) {}

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }

  toString() {
    return `${this.tokenLiteral()} ${this.returnValue?.toString() ?? ''};`
  }
}

export class ExpressionStatement implements Statement {
  constructor(public token: Token, public expression?: Expression) {}

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }

  toString() {
    return this.expression?.toString() ?? ''
  }
}

export class BlockStatement implements Statement {
  constructor(public token: Token, public statements: Statement[] = []) {}

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }

  toString() {
    return this.statements.map((stmt) => stmt.toString())
  }
}

export class Identifier implements Expression {
  constructor(public token: Token, public value: string) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }

  toString() {
    return this.value
  }
}

export class Boolean implements Expression {
  constructor(public token: Token, public value: boolean) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }

  toString() {
    return this.token.literal
  }
}

export class IntegerLiteral implements Expression {
  constructor(public token: Token, public value?: Int) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }

  toString() {
    return this.token.literal
  }
}

export class PrefixExpression implements Expression {
  constructor(
    public token: Token,
    public operator: string,
    public right?: Expression
  ) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }

  toString() {
    return `(${this.operator}${this.right?.toString() ?? ''})`
  }
}

export class InfixExpression implements Expression {
  constructor(
    public token: Token,
    public operator: string,
    public left: Expression,
    public right?: Expression
  ) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }

  toString() {
    return `(${this.left.toString()} ${this.operator} ${
      this.right?.toString() ?? ''
    })`
  }
}

export class IfExpression implements Expression {
  constructor(
    public token: Token,
    public condition?: Expression,
    public consequence?: BlockStatement,
    public alternative?: BlockStatement
  ) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }

  toString() {
    let ret = `if ${this.condition!.toString()} ${this.consequence!.toString()}`
    if (this.alternative) {
      ret += `else ${this.alternative.toString()}`
    }
    return ret
  }
}

export class FunctionLiteral implements Expression {
  constructor(
    public token: Token,
    public parameters: Identifier[],
    public body: BlockStatement
  ) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }

  toString() {
    return `${this.tokenLiteral()}(${this.parameters
      .map((p) => p.toString())
      .join(', ')}}${this.body.toString()}`
  }
}

export class CallExpression implements Expression {
  constructor(
    public token: Token,
    public func: Expression,
    public args: Expression[]
  ) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }

  toString() {
    return `${this.func.toString()}(${this.args
      .map((arg) => arg.toString())
      .join(', ')})`
  }
}
