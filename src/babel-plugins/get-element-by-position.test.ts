import generator from '@babel/generator'
//@ts-ignore
import babelPluginSyntaxJsx from '@babel/plugin-syntax-jsx'
import { transform } from '@babel/standalone'
import BabelPluginGetElementByPosition, {
  inRange,
} from './get-element-by-position'

function testGetElementByPosition(
  code: string,
  position: CodeMirror.Position,
  expected: string,
) {
  const babelPluginGetElementByPosition = new BabelPluginGetElementByPosition(
    position,
  )

  transform(code, {
    plugins: [babelPluginSyntaxJsx, babelPluginGetElementByPosition.plugin],
  })

  expect(babelPluginGetElementByPosition.data).not.toBeNull()
  if (!babelPluginGetElementByPosition.data) return
  expect(generator(babelPluginGetElementByPosition.data).code).toEqual(expected)
}

test('handles position at the start of a JSX element', () => {
  const code = `<div>
  <h1>Hello world</h1>
  <button>Click me</button>
</div>`
  const position = { line: 1, ch: 2 } // Start of <h1>
  const expected = '<h1>Hello world</h1>'

  testGetElementByPosition(code, position, expected)
})

test('handles position in the middle of a JSX element', () => {
  const code = `<div>
  <h1>Hello world</h1>
  <button>Click me</button>
</div>`
  const position = { line: 1, ch: 10 } // Middle of <h1>Hello world</h1>
  const expected = '<h1>Hello world</h1>'

  testGetElementByPosition(code, position, expected)
})

test('handles position at the end of a JSX element', () => {
  const code = `<div>
  <h1>Hello world</h1>
  <button>Click me</button>
</div>`
  const position = { line: 1, ch: 22 } // End of </h1>
  const expected = '<h1>Hello world</h1>'

  testGetElementByPosition(code, position, expected)
})

test('handles position between two JSX elements', () => {
  const code = `<><h1>Hello world</h1><button>Click me</button></>`
  const position = { line: 0, ch: 22 } // Between </h1> and <button>
  const expected = '<button>Click me</button>'

  testGetElementByPosition(code, position, expected)
})

describe('inRange', () => {
  test('returns expected value', () => {
    const location = {
      start: { line: 1, column: 2 },
      end: { line: 3, column: 2 },
    }

    expect(inRange({ line: 0, ch: 1 }, location)).toEqual(false)
    expect(inRange({ line: 0, ch: 2 }, location)).toEqual(true)
    expect(inRange({ line: 0, ch: 3 }, location)).toEqual(true)
    expect(inRange({ line: 0, ch: 4 }, location)).toEqual(true)
    expect(inRange({ line: 1, ch: 4 }, location)).toEqual(true)
    expect(inRange({ line: 2, ch: 1 }, location)).toEqual(true)
    expect(inRange({ line: 2, ch: 2 }, location)).toEqual(true)
    expect(inRange({ line: 2, ch: 3 }, location)).toEqual(false)
  })
})
