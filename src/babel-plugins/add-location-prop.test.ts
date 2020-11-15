//@ts-ignore
import babelPluginSyntaxJsx from '@babel/plugin-syntax-jsx'
import { transform } from '@babel/standalone'
import babelPluginAddLocProp from './add-location-prop'

test('adds location prop to JSX elements', () => {
  const result = transform('<h1>Hello world</h1>', {
    plugins: [babelPluginSyntaxJsx, babelPluginAddLocProp],
  }).code?.replace(/;$/, '')

  const expected = `<h1 __location={{
  start: {
    line: 1,
    column: 0
  },
  end: {
    line: 1,
    column: 20
  }
}}>Hello world</h1>`

  expect(result).toEqual(expected)
})
