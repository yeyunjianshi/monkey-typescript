import * as readLine from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { newLexer } from './lexer'
import { TokenType } from './token'

const PROMPT = '>> '

async function execute() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const rl = readLine.createInterface({ input, output })
    const answer = await rl.question(PROMPT)

    const lexer = newLexer(answer)

    let token = lexer.nextToken()
    while (token.type !== TokenType.EOF) {
      console.log(token)
      token = lexer.nextToken()
    }
    console.log()
    rl.close()
  }
}

execute()
