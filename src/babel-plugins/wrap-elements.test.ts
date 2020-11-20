//@ts-ignore
import babelPluginSyntaxJsx from '@babel/plugin-syntax-jsx'
import { transform } from '@babel/standalone'
import babelPluginWrapElements from './wrap-elements'

test('wraps JSX elements', () => {
  const code = '<div><h1 style={{ margin: 0 }}>Hello world</h1></div>'

  const result = transform(code, {
    plugins: [babelPluginSyntaxJsx, babelPluginWrapElements],
  }).code?.replace(/;$/, '')

  expect(result).toMatchSnapshot()
})
